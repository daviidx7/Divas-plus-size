import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { money } from '../../utils/format.js';
import { STATUS } from '../../utils/status.js';

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setDados(res.data)).catch(() => setErro(true));
  }, []);

  if (erro) {
    return (
      <p className="text-red-600">
        Não foi possível carregar o painel. Confira se o servidor está ligado.
      </p>
    );
  }
  if (!dados) return <p className="text-gray-500">Carregando…</p>;

  const cards = [
    { label: 'Total de produtos', valor: dados.totalProdutos, to: '/admin/produtos' },
    { label: 'Em estoque', valor: dados.produtosEmEstoque, to: '/admin/produtos' },
    { label: 'Esgotados', valor: dados.produtosEsgotados, to: '/admin/produtos?filtro=esgotados' },
    { label: 'Total de pedidos', valor: dados.totalPedidos, to: '/admin/pedidos' },
  ];

  return (
    <div>
      <h1 className="text-2xl text-vinho mb-4">Início</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold text-vinho">{c.valor}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Pedidos recentes</h2>
          <Link to="/admin/pedidos" className="text-sm text-vinho underline">Ver todos</Link>
        </div>

        {dados.pedidosRecentes.length === 0 && (
          <p className="text-gray-500 text-sm py-2">Nenhum pedido ainda.</p>
        )}

        <ul className="divide-y">
          {dados.pedidosRecentes.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.customer.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">{money(p.total)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[p.status]?.cor}`}>
                  {STATUS[p.status]?.label || p.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
