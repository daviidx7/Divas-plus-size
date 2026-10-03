// Baixa o estoque de cada variante (tamanho + cor) dentro de uma transação.
//
// A conferência e a baixa acontecem no MESMO comando (updateMany com stock >= quantidade).
// Assim, se dois clientes tentarem comprar a última peça ao mesmo tempo, só um consegue:
// o estoque nunca fica negativo nem vende além do que existe.
//
// tx: cliente da transação do Prisma | items: [{ variantId, quantity }]
async function baixarEstoque(tx, items) {
  for (const { variantId, quantity } of items) {
    const resultado = await tx.productVariant.updateMany({
      where: { id: variantId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (resultado.count !== 1) {
      const variante = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      const mensagem = variante
        ? `"${variante.product.name}" (${variante.size}/${variante.color}) ${
            variante.stock === 0
              ? 'acabou de esgotar'
              : `tem só ${variante.stock} unidade(s) em estoque`
          }. Ajuste o carrinho e tente de novo.`
        : 'Um dos produtos do carrinho não existe mais.';

      throw Object.assign(new Error(mensagem), { status: 409 });
    }
  }
}

module.exports = { baixarEstoque };
