// Serviço isolado para falar com a API do Mercado Pago.
// Usa fetch nativo do Node 18+, sem precisar instalar o SDK deles.

const MP_BASE_URL = 'https://api.mercadopago.com';

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw Object.assign(
      new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no .env do backend.'),
      { status: 500 }
    );
  }
  return token;
}

// Cria uma "preference" (a página de pagamento) para um pedido já criado no banco.
// pedido: objeto Order com items -> product (do Prisma)
async function criarPreferencia(pedido) {
  const accessToken = getAccessToken();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const items = pedido.items.map((item) => ({
    title: item.product.name,
    quantity: item.quantity,
    unit_price: Number(item.price),
    currency_id: 'BRL',
  }));

  const resposta = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      items,
      external_reference: pedido.id,
      back_urls: {
        success: `${frontendUrl}/pedido-confirmado`,
        failure: `${frontendUrl}/checkout`,
        pending: `${frontendUrl}/pedido-confirmado`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3333'}/api/payments/webhook`,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw Object.assign(
      new Error(`Falha ao criar preferência no Mercado Pago: ${detalhe}`),
      { status: 502 }
    );
  }

  const dados = await resposta.json();
  return { id: dados.id, initPoint: dados.init_point };
}

// Busca os detalhes de um pagamento pelo id (usado no webhook)
async function buscarPagamento(paymentId) {
  const accessToken = getAccessToken();

  const resposta = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resposta.ok) {
    throw Object.assign(new Error('Falha ao consultar pagamento no Mercado Pago.'), { status: 502 });
  }

  return resposta.json();
}

module.exports = { criarPreferencia, buscarPagamento };
