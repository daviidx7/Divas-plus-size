const prisma = require('../config/prisma');

// Só mostra tamanhos/cores ativos (os "removidos" que já tiveram vendas ficam escondidos)
const includeCompleto = {
  images: { orderBy: { order: 'asc' } },
  variants: { where: { active: true } },
  category: true,
};

const MSG_VARIANTE_REPETIDA = 'Esse produto já tem essa combinação de tamanho e cor. Ajuste o estoque dela em vez de repetir.';

// Limpa a lista de tamanhos/cores/estoque vinda do formulário
function normalizarVariantes(variants = []) {
  return variants
    .filter((v) => v && v.size && String(v.color || '').trim())
    .map((v) => ({
      id: v.id,
      size: String(v.size),
      color: String(v.color).trim(),
      stock: Math.max(0, parseInt(v.stock, 10) || 0),
    }));
}

// Cria um tamanho/cor. Se existir um igual que foi removido antes, só reativa.
// Se existir um igual ativo, devolve o erro de repetido.
async function criarOuReativarVariante(client, productId, dados) {
  const existente = await client.productVariant.findUnique({
    where: {
      productId_size_color: { productId, size: dados.size, color: dados.color },
    },
  });

  if (existente && existente.active) {
    const erro = new Error('Variante repetida');
    erro.code = 'P2002';
    throw erro;
  }

  if (existente) {
    return client.productVariant.update({
      where: { id: existente.id },
      data: { stock: dados.stock, active: true },
    });
  }

  return client.productVariant.create({ data: { ...dados, productId } });
}

// GET /api/products - lista pública, com filtros opcionais
// query: categoria, tamanho, precoMin, precoMax, busca, esgotados=true|false
async function listar(req, res, next) {
  try {
    const { categoria, tamanho, precoMin, precoMax, busca, esgotados } = req.query;

    const where = { active: true };

    if (categoria) where.category = { slug: categoria };
    if (busca) where.name = { contains: busca, mode: 'insensitive' };
    if (precoMin || precoMax) {
      where.price = {};
      if (precoMin) where.price.gte = Number(precoMin);
      if (precoMax) where.price.lte = Number(precoMax);
    }
    if (tamanho) where.variants = { some: { size: tamanho, active: true } };

    let produtos = await prisma.product.findMany({
      where,
      include: includeCompleto,
      orderBy: { createdAt: 'desc' },
    });

    // Produto esgotado = soma do estoque de todas as variantes é 0
    produtos = produtos.map((p) => ({
      ...p,
      totalEstoque: p.variants.reduce((soma, v) => soma + v.stock, 0),
    }));

    if (esgotados === 'true') produtos = produtos.filter((p) => p.totalEstoque === 0);
    if (esgotados === 'false') produtos = produtos.filter((p) => p.totalEstoque > 0);

    return res.json(produtos);
  } catch (err) {
    return next(err);
  }
}

// GET /api/products/:id
async function buscarPorId(req, res, next) {
  try {
    const produto = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: includeCompleto,
    });

    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    return res.json(produto);
  } catch (err) {
    return next(err);
  }
}

// POST /api/admin/products (protegida)
// body: { name, description, price, categoryId, images: [url], variants: [{size, color, stock}] }
async function criar(req, res, next) {
  try {
    const { name, description, price, categoryId, images = [], destaque = false } = req.body;
    const variants = normalizarVariantes(req.body.variants);

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ error: 'Nome, descrição, preço e categoria são obrigatórios.' });
    }

    if (!variants.length) {
      return res.status(400).json({ error: 'Cadastre ao menos um tamanho/cor com estoque.' });
    }

    const produto = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        destaque: Boolean(destaque),
        images: { create: images.filter(Boolean).map((url, i) => ({ url, order: i })) },
        variants: {
          create: variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })),
        },
      },
      include: includeCompleto,
    });

    return res.status(201).json(produto);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: MSG_VARIANTE_REPETIDA });
    return next(err);
  }
}

// PUT /api/admin/products/:id (protegida)
// Salva dados gerais, FOTOS e tamanhos/cores/estoque. Variantes com "id" são atualizadas;
// variantes sem "id" são criadas. (Para tirar uma, use o botão de remover tamanho/cor.)
async function atualizar(req, res, next) {
  try {
    const id = req.params.id;
    const { name, description, price, categoryId, active, images, destaque } = req.body;
    const variants = Array.isArray(req.body.variants) ? normalizarVariantes(req.body.variants) : null;

    const produto = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          categoryId,
          active,
          ...(destaque !== undefined ? { destaque: Boolean(destaque) } : {}),
        },
      });

      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        const urls = images.filter(Boolean);
        if (urls.length) {
          await tx.productImage.createMany({
            data: urls.map((url, i) => ({ url, order: i, productId: id })),
          });
        }
      }

      if (variants) {
        for (const v of variants) {
          const dados = { size: v.size, color: v.color, stock: v.stock };
          if (v.id) {
            await tx.productVariant.update({ where: { id: v.id, productId: id }, data: dados });
          } else {
            await criarOuReativarVariante(tx, id, dados);
          }
        }
      }

      return tx.product.findUnique({ where: { id }, include: includeCompleto });
    });

    return res.json(produto);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: MSG_VARIANTE_REPETIDA });
    return next(err);
  }
}

// DELETE /api/admin/products/:id (protegida)
// Produto que nunca vendeu é apagado. Produto que já tem pedidos não pode sumir do histórico,
// então é apenas ocultado da loja.
async function excluir(req, res, next) {
  try {
    const id = req.params.id;

    const vendas = await prisma.orderItem.count({ where: { productId: id } });

    // Já foi vendido: não apaga (perderia o histórico), só oculta da loja
    if (vendas > 0) {
      await prisma.product.update({ where: { id }, data: { active: false } });
      return res.json({ ocultado: true });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    return next(err);
  }
}

// PATCH /api/admin/products/:id/variants/:variantId (protegida)
// Ajusta manualmente o estoque de um tamanho/cor específico
async function atualizarEstoqueVariante(req, res, next) {
  try {
    const { variantId } = req.params;
    const stock = Number(req.body.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: 'Informe uma quantidade de estoque válida.' });
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    return res.json(variant);
  } catch (err) {
    return next(err);
  }
}

// POST /api/admin/products/:id/variants (protegida) - adiciona novo tamanho/cor a um produto existente
async function adicionarVariante(req, res, next) {
  try {
    const { size, color, stock } = req.body;

    const variant = await criarOuReativarVariante(prisma, req.params.id, {
      size,
      color,
      stock: Math.max(0, parseInt(stock, 10) || 0),
    });

    return res.status(201).json(variant);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: MSG_VARIANTE_REPETIDA });
    return next(err);
  }
}

// DELETE /api/admin/products/:id/variants/:variantId (protegida)
// Remove um tamanho/cor. Se nunca vendeu, apaga. Se já vendeu, só esconde (mantém o histórico).
async function removerVariante(req, res, next) {
  try {
    const { id, variantId } = req.params;

    const ativas = await prisma.productVariant.count({
      where: { productId: id, active: true },
    });

    if (ativas <= 1) {
      return res.status(400).json({
        error: 'O produto precisa ter ao menos um tamanho/cor. Para tirar o produto da loja, use Excluir.',
      });
    }

    const vendas = await prisma.orderItem.count({ where: { variantId } });

    if (vendas > 0) {
      await prisma.productVariant.update({
        where: { id: variantId, productId: id },
        data: { active: false, stock: 0 },
      });
      return res.json({ ocultado: true });
    }

    await prisma.productVariant.delete({ where: { id: variantId, productId: id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Tamanho/cor não encontrado.' });
    }
    return next(err);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  atualizarEstoqueVariante,
  adicionarVariante,
  removerVariante,
};