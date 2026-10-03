import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import WhatsAppIcon from '../../components/WhatsAppIcon.jsx';
import { money, phoneToWhatsApp } from '../../utils/format.js';
import { STATUS } from '../../utils/status.js';

export default function Orders() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function carregar() {
    api
      .get('/admin/orders')
      .then((res) => setPedidos(res.data))
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(); }, []);

  async function alterarStatus(id, status) {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      carregar();
    } catch {
      alert('Não foi possível alterar o status. Tente de novo.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl text-vinho mb-4">Pedidos</h1>

      {carregando && <p className="text-gray-500">Carregando…</p>}
      {!carregando && pedidos.length === 0 && <p className="text-gray-500">Nenhum pedido ainda.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {pedidos.map((p) => {
          const retirada = p.deliveryType === 'RETIRADA';
          const zap = phoneToWhatsApp(p.customer.phone);

          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Pedido #{p.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS[p.status]?.cor}`}>
                  {STATUS[p.status]?.label || p.status}
                </span>
              </div>

              <div className="mt-3">
                <p className="font-medium">{p.customer.name}</p>
                {zap ? (
                  <a
                    href={`https://wa.me/${zap}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-green-700 py-1"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {p.customer.phone}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">{p.customer.phone}</p>
                )}
              </div>

              <ul className="mt-2 text-sm text-gray-700 space-y-0.5">
                {p.items.map((i) => (
                  <li key={i.id}>
                    {i.quantity}× {i.product.name} ({i.variant.size}/{i.variant.color})
                  </li>
                ))}
              </ul>

              <div className="mt-3 rounded-lg bg-rosa px-3 py-2 text-sm text-vinho">
                {retirada ? (
                  <strong>Retirada na loja</strong>
                ) : (
                  <>
                    <strong>Entrega · {p.address?.city}</strong>
                    {p.address && (
                      <span className="block text-gray-700">
                        {p.address.street}, {p.address.number}
                        {p.address.complement ? ` - ${p.address.complement}` : ''} · CEP {p.address.cep}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Total {Number(p.freight) > 0 && `(com entrega ${money(p.freight)})`}
                </span>
                <strong className="text-lg text-vinho">{money(p.total)}</strong>
              </div>

              <select
                value={p.status}
                onChange={(e) => alterarStatus(p.id, e.target.value)}
                aria-label="Status do pedido"
                className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
              >
                {Object.entries(STATUS).map(([valor, { label }]) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
