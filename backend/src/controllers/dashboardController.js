const prisma = require('../config/prisma');

// GET /api/admin/dashboard (protegida)
async function resumo(req, res, next) {
  try {
    const produtos = await prisma.product.findMany({ include: { variants: true } });
    const totalProdutos = produtos.length;
    const produtosEsgotados = produtos.filter(
      (p) => p.variants.reduce((s, v) => s + v.stock, 0) === 0
    ).length;
    const produtosEmEstoque = totalProdutos - produtosEsgotados;

    const totalPedidos = await prisma.order.count();

    const pedidosRecentes = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    return res.json({
      totalProdutos,
      produtosEmEstoque,
      produtosEsgotados,
      totalPedidos,
      pedidosRecentes,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { resumo };
