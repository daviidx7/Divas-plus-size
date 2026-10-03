// ============================================================
// Dados da loja. Para mudar o WhatsApp, altere só aqui.
// ============================================================
export const STORE_NAME = 'Diva Moda Plus Size';

// Formato: 55 (Brasil) + DDD + número, só números.
export const WHATSAPP_NUMBER = '5561984629080';
export const WHATSAPP_DISPLAY = '(61) 98462-9080';

// Gera o link que abre o WhatsApp já com uma mensagem pronta.
export function whatsappLink(mensagem = '') {
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
  return `https://wa.me/${WHATSAPP_NUMBER}${texto}`;
}
