// ============================================================
// Configurações de ENTREGA, CORREIOS e RETIRADA
// ============================================================

// Valor FIXO da entrega por motoboy (só para as regiões da lista abaixo), em reais.
// >>> Valor provisório. Quando definir o preço final, troque só o número abaixo e salve. <<<
const DELIVERY_FEE = 20;

// Valor FIXO do envio pelos Correios (para qualquer outra região/cidade), em reais.
// >>> Valor provisório. Troque só o número abaixo quando quiser mudar. <<<
const CORREIOS_FEE = 20;

// Texto mostrado para quem escolhe "Retirar na loja".
const PICKUP_INFO =
  'Retirada sem custo. O local e o horário são combinados pelo WhatsApp depois da compra.';

// Texto mostrado para quem escolhe "Correios".
const CORREIOS_INFO =
  'Envio pelos Correios para todo o Brasil. O prazo é informado pela loja após a postagem.';

// Regiões do DF que recebem entrega por MOTOBOY (frete fixo acima).
// Para adicionar ou remover uma região, edite a lista abaixo.
// Quem for de outra região usa a opção "Correios" no checkout.
const DELIVERY_REGIONS = ['Taguatinga', 'Ceilândia', 'Samambaia Norte', 'Samambaia Sul'];

module.exports = { DELIVERY_FEE, CORREIOS_FEE, PICKUP_INFO, CORREIOS_INFO, DELIVERY_REGIONS };
