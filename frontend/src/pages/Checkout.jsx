import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import useDelivery from '../hooks/useDelivery.js';
import { money } from '../utils/format.js';

const campo =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-vinho';

export default function Checkout() {
  const { itens, subtotal, limparCarrinho } = useCart();
  const delivery = useDelivery();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState('ENTREGA'); // 'ENTREGA' (motoboy) | 'CORREIOS' | 'RETIRADA'
  const [enviando, setEnviando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '',
    region: '', cep: '', street: '', number: '', complement: '', city: '', state: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  if (itens.length === 0 && !finalizado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-vinho mb-4">Seu carrinho está vazio</h1>
        <Link to="/catalogo" className="text-vinho underline">Ver produtos</Link>
      </div>
    );
  }

  const entrega = tipo === 'ENTREGA';
  const correios = tipo === 'CORREIOS';
  const frete = entrega && delivery ? delivery.motoboyFee : correios && delivery ? delivery.correiosFee : 0;
  const total = subtotal + frete;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (entrega && !form.region) {
      setErro('Escolha a sua região para a entrega por motoboy, ou use "Correios"/"Retirar na loja".');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        deliveryType: tipo,
        customer: { name: form.name, email: form.email, phone: form.phone, cpf: form.cpf },
        items: itens.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      };
      if (entrega) {
        payload.address = {
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          city: form.region,
          state: 'DF',
        };
      } else if (correios) {
        payload.address = {
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          city: form.city,
          state: form.state,
        };
      }

      const { data: pedido } = await api.post('/orders', payload);

      setFinalizado(true);
      limparCarrinho();

      // Tenta abrir o pagamento do Mercado Pago. Se as credenciais ainda não estiverem
      // configuradas no servidor, vai direto para a confirmação (pedido fica "Pendente").
      try {
        const { data: pagamento } = await api.post(`/payments/preference/${pedido.id}`);
        window.location.href = pagamento.initPoint;
      } catch {
        navigate('/pedido-confirmado', { state: { tipo } });
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível concluir o pedido. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const cartao = (ativo) =>
    `block cursor-pointer rounded-lg border p-4 ${
      ativo ? 'border-vinho bg-rosa' : 'border-gray-300 bg-white'
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto px-4 py-6 sm:py-10 grid gap-8 lg:grid-cols-3"
    >
      <div className="lg:col-span-2 space-y-8">
        <section className="space-y-3">
          <h1 className="text-2xl text-vinho">Seus dados</h1>
          <input name="name" required autoComplete="name" placeholder="Nome completo" value={form.name} onChange={handleChange} className={campo} />
          <input name="email" type="email" inputMode="email" required autoComplete="email" placeholder="E-mail" value={form.email} onChange={handleChange} className={campo} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="Telefone / WhatsApp" value={form.phone} onChange={handleChange} className={campo} />
            <input name="cpf" inputMode="numeric" required placeholder="CPF (só números)" value={form.cpf} onChange={handleChange} className={campo} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl text-vinho">Como você quer receber?</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className={cartao(entrega)}>
              <input type="radio" name="tipo" className="sr-only" checked={entrega} onChange={() => setTipo('ENTREGA')} />
              <span className="block font-semibold">Entrega (motoboy)</span>
              <span className="text-sm text-gray-600">
                {delivery ? money(delivery.motoboyFee) : 'Carregando…'}
              </span>
            </label>

            <label className={cartao(correios)}>
              <input type="radio" name="tipo" className="sr-only" checked={correios} onChange={() => setTipo('CORREIOS')} />
              <span className="block font-semibold">Correios</span>
              <span className="text-sm text-gray-600">
                {delivery ? money(delivery.correiosFee) : 'Carregando…'}
              </span>
            </label>

            <label className={cartao(!entrega && !correios)}>
              <input type="radio" name="tipo" className="sr-only" checked={!entrega && !correios} onChange={() => setTipo('RETIRADA')} />
              <span className="block font-semibold">Retirar na loja</span>
              <span className="text-sm text-gray-600">Sem custo</span>
            </label>
          </div>

          {!entrega && !correios && delivery && (
            <p className="rounded-lg bg-rosa text-vinho px-4 py-3 text-sm">{delivery.pickupInfo}</p>
          )}

          {correios && delivery && (
            <p className="rounded-lg bg-rosa text-vinho px-4 py-3 text-sm">{delivery.correiosInfo}</p>
          )}

          {entrega && (
            <div className="space-y-3">
              <select name="region" required value={form.region} onChange={handleChange} className={campo}>
                <option value="">Escolha a sua região (só atendemos essas por motoboy)</option>
                {delivery?.regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {!delivery?.regions.length ? null : (
                <p className="text-xs text-gray-500">
                  Não é da sua região? Use a opção <strong>Correios</strong> aqui em cima.
                </p>
              )}

              {form.region && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="cep" required inputMode="numeric" autoComplete="postal-code" placeholder="CEP" value={form.cep} onChange={handleChange} className={campo} />
                    <input name="number" required placeholder="Número" value={form.number} onChange={handleChange} className={campo} />
                  </div>
                  <input name="street" required autoComplete="address-line1" placeholder="Endereço (rua, quadra, conjunto...)" value={form.street} onChange={handleChange} className={campo} />
                  <input name="complement" placeholder="Complemento (opcional)" value={form.complement} onChange={handleChange} className={campo} />
                </>
              )}
            </div>
          )}

          {correios && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="cep" required inputMode="numeric" autoComplete="postal-code" placeholder="CEP" value={form.cep} onChange={handleChange} className={campo} />
                <input name="number" required placeholder="Número" value={form.number} onChange={handleChange} className={campo} />
              </div>
              <input name="street" required autoComplete="address-line1" placeholder="Endereço (rua, avenida...)" value={form.street} onChange={handleChange} className={campo} />
              <input name="complement" placeholder="Complemento (opcional)" value={form.complement} onChange={handleChange} className={campo} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="city" required autoComplete="address-level2" placeholder="Cidade" value={form.city} onChange={handleChange} className={campo} />
                <input name="state" required maxLength={2} autoComplete="address-level1" placeholder="Estado (UF, ex: DF)" value={form.state} onChange={(e) => handleChange({ target: { name: 'state', value: e.target.value.toUpperCase() } })} className={campo} />
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="border rounded-lg p-4 h-fit space-y-2">
        <h2 className="font-semibold mb-2">Resumo da compra</h2>
        {itens.map((i) => (
          <div key={i.variantId} className="flex justify-between gap-3 text-sm">
            <span>{i.name} ({i.size}/{i.color}) x{i.quantity}</span>
            <span className="shrink-0">{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-3 border-t">
          <span>Produtos</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{entrega ? 'Entrega (motoboy)' : correios ? 'Correios' : 'Retirada'}</span>
          <span>{entrega || correios ? money(frete) : 'Grátis'}</span>
        </div>
        <div className="flex justify-between font-semibold text-vinho text-lg pt-1">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>

        {erro && <p role="alert" className="text-red-600 text-sm pt-2">{erro}</p>}

        <button
          disabled={enviando || !delivery}
          className="w-full mt-3 bg-vinho text-white py-3.5 rounded-full font-medium text-base hover:bg-vinho/90 disabled:opacity-50"
        >
          {enviando ? 'Processando...' : 'Confirmar pedido'}
        </button>
      </aside>
    </form>
  );
}
