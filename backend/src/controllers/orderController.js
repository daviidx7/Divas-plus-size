const prisma = require('../config/prisma');
const { baixarEstoque } = require('../services/stockService');
const {
  DELIVERY_FEE,
  CORREIOS_FEE,
  PICKUP_INFO,
  CORREIOS_INFO,
  DELIVERY_REGIONS,
} = require('../config/delivery');

const STATUS_VALIDOS = ['PENDENTE', 'PAGO', 'PREPARANDO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO'];

function erroHttp(status, message) {
  return Object.assign(new Error(message), { status });
}

const soDigitos = (valor) => String(valor || '').replace(/\D/g, '');
const arredondar = (n) => Math.round(n * 100) / 100;

// GET /api/delivery - opções de entrega/retirada/Correios para o site mostrar ao cliente
function opcoesEntrega(req, res) {
  return res.json({
    motoboyFee: DELIVERY_FEE,
    correiosFee: CORREIOS_FEE,
    pickupInfo: PICKUP_INFO,
    correiosInfo: CORREIOS_INFO,
    regions: DELIVERY_REGIONS,
  });
}

// POST /api/orders - checkout público
// body: {
//   deliveryType: 'ENTREGA' | 'CORREIOS' | 'RETIRADA',
//   customer: { name, email, phone, cpf },
//   address: { cep, street, number, complement, city, state }   // ENTREGA (região do DF) ou CORREIOS (qualquer lugar)
//   items: [{ variantId, quantity }]
// }
// Preços e frete são calculados AQUI no servidor (nunca confiamos no valor enviado pelo navegador).
async function criar(req, res, next) {
  try {
    const { customer, address, items, deliveryType = 'ENTREGA' } = req.body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.cpf) {
      throw erroHttp(400, 'Preencha nome, e-mail, telefone e CPF.');
    }

    const cpf = soDigitos(customer.cpf);
    if (cpf.length !== 11) throw erroHttp(400, 'CPF inválido. Digite os 11 números.');

    if (!Array.isArray(items) || items.length === 0) {
      throw erroHttp(400, 'O carrinho está vazio.');
    }

    if (!['ENTREGA', 'CORREIOS', 'RETIRADA'].includes(deliveryType)) {
      throw erroHttp(400, 'Forma de recebimento inválida.');
    }

    // Junta itens repetidos e valida as quantidades
    const qtdPorVariante = new Map();
    for (const item of items) {
      const qtd = Number(item.quantity);
      if (!item.variantId || !Number.isInteger(qtd) || qtd < 1) {
        throw erroHttp(400, 'Item do carrinho inválido.');
      }
      qtdPorVariante.set(item.variantId, (qtdPorVariante.get(item.variantId) || 0) + qtd);
    }

    // ENTREGA (motoboy): exige endereço e uma das regiões atendidas, sempre no DF.
    // CORREIOS: exige endereço completo, de qualquer cidade/estado do Brasil.
    // RETIRADA: sem endereço e sem frete.
    let endereco = null;
    if (deliveryType === 'ENTREGA') {
      if (!address?.cep || !address?.street || !address?.number || !address?.city) {
        throw erroHttp(400, 'Preencha o endereço de entrega completo.');
      }
      if (!DELIVERY_REGIONS.includes(address.city)) {
        throw erroHttp(
          400,
          'Ainda não entregamos por motoboy nessa região. Escolha "Correios" ou "Retirar na loja".'
        );
      }
      endereco = {
        cep: String(address.cep),
        street: String(address.street),
        number: String(address.number),
        complement: address.complement ? String(address.complement) : null,
        city: address.city,
        state: 'DF',
      };
    } else if (deliveryType === 'CORREIOS') {
      if (
        !address?.cep ||
        !address?.street ||
        !address?.number ||
        !address?.city ||
        !address?.state
      ) {
        throw erroHttp(400, 'Preencha o endereço completo para envio pelos Correios.');
      }
      endereco = {
        cep: String(address.cep),
        street: String(address.street),
        number: String(address.number),
        complement: address.complement ? String(address.complement) : null,
        city: String(address.city),
        state: String(address.state).toUpperCase().slice(0, 2),
      };
    }

    const freight =
      deliveryType === 'ENTREGA' ? DELIVERY_FEE : deliveryType === 'CORREIOS' ? CORREIOS_FEE : 0;

    // Tudo numa transação: ou o pedido inteiro é gravado (com a baixa de estoque), ou nada muda.
    const pedido = await prisma.$transaction(
      async (tx) => {
        const variantes = await tx.productVariant.findMany({
          where: { id: { in: [...qtdPorVariante.keys()] } },
          include: { product: true },
        });

        if (variantes.length !== qtdPorVariante.size) {
          throw erroHttp(404, 'Um dos produtos do carrinho não existe mais.');
        }

        for (const v of variantes) {
          if (!v.product.active) {
            throw erroHttp(409, `"${v.product.name}" não está mais à venda.`);
          }
        }

        await baixarEstoque(
          tx,
          [...qtdPorVariante].map(([variantId, quantity]) => ({ variantId, quantity }))
        );

        const totalProdutos = variantes.reduce(
          (soma, v) => soma + Number(v.product.price) * qtdPorVariante.get(v.id),
          0
        );

        const cliente = await tx.customer.upsert({
          where: { cpf },
          update: { name: customer.name, phone: customer.phone, email: customer.email },
          create: { name: customer.name, email: customer.email, phone: customer.phone, cpf },
        });

        const enderecoCriado = endereco
          ? await tx.address.create({ data: { ...endereco, customerId: cliente.id } })
          : null;

        return tx.order.create({
          data: {
            customerId: cliente.id,
            addressId: enderecoCriado ? enderecoCriado.id : null,
            deliveryType,
            freight,
            total: arredondar(totalProdutos + freight),
            items: {
              create: variantes.map((v) => ({
                productId: v.productId,
                variantId: v.id,
                quantity: qtdPorVariante.get(v.id),
                price: v.product.price,
              })),
            },
          },
          include: { items: true, customer: true, address: true },
        });
      },
      { timeout: 15000 }
    );

    return res.status(201).json(pedido);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Esse e-mail já foi usado com outro CPF. Use o mesmo CPF da compra anterior ou outro e-mail.',
      });
    }
    return next(err);
  }
}

// GET /api/admin/orders (protegida)
async function listar(req, res, next) {
  try {
    const pedidos = await prisma.order.findMany({
      include: {
        customer: true,
        address: true,
        items: { include: { product: true, variant: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(pedidos);
  } catch (err) {
    return next(err);
  }
}

// GET /api/admin/orders/:id (protegida)
async function buscarPorId(req, res, next) {
  try {
    const pedido = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        address: true,
        items: { include: { product: true, variant: true } },
      },
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    return res.json(pedido);
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/admin/orders/:id/status (protegida)
async function atualizarStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!STATUS_VALIDOS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status inválido. Use um de: ${STATUS_VALIDOS.join(', ')}` });
    }

    const pedido = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json(pedido);
  } catch (err) {
    return next(err);
  }
}

module.exports = { opcoesEntrega, criar, listar, buscarPorId, atualizarStatus };
