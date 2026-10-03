// Formata um número como dinheiro: 15 -> "R$ 15,00"
export function money(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Converte o telefone digitado pelo cliente para o formato do link do WhatsApp (55 + DDD + número)
export function phoneToWhatsApp(telefone) {
  const digitos = String(telefone || '').replace(/\D/g, '');
  if (!digitos) return '';
  return digitos.startsWith('55') && digitos.length >= 12 ? digitos : `55${digitos}`;
}
