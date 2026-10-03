const prisma = require('../config/prisma');
const mercadopagoService = require('../services/mercadopagoService');

// POST /api/payments/preference/:orderId
// Cria a "página de pagamento" do Mercado Pago para um pedido já criado
async function criarPreferencia(req, res, next) {
  try {
    const pedido = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { items: { include: { product: true } } },
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const preferencia = await mercadopagoService.criarPreferencia(pedido);

    return res.json(preferencia);
  } catch (err) {
    return next(err);
  }
}

// POST /api/payments/webhook
// O Mercado Pago chama essa URL sempre que o status de um pagamento muda
async function webhook(req, res, next) {
  try {
    const { type, data } = req.body;

    if (type === 'payment' && data?.id) {
      const pagamento = await mercadopagoService.buscarPagamento(data.id);
      const orderId = pagamento.external_reference;

      const statusMap = {
        approved: 'PAGO',
        pending: 'PENDENTE',
        in_process: 'PENDENTE',
        rejected: 'CANCELADO',
        cancelled: 'CANCELADO',
        refunded: 'CANCELADO',
      };

      const novoStatus = statusMap[pagamento.status];

      if (orderId && novoStatus) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: novoStatus },
        });
      }
    }

    // O Mercado Pago só precisa de um 200 confirmando que recebemos a notificação
    return res.status(200).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { criarPreferencia, webhook };
