import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { imageUrl } from '../../services/api';
import { money } from '../../utils/format.js';

// Um tamanho/cor com botões − e + para colocar ou tirar estoque na hora,
// e um botão de lixeira para remover esse tamanho/cor do produto
function VarianteEstoque({ produtoId, variante, podeRemover, aoRemover }) {
  const [estoque, setEstoque] = useState(variante.stock);
  const [salvando, setSalvando] = useState(false);

  async function alterar(novo) {
    if (novo < 0 || salvando) return;
    const anterior = estoque;
    setEstoque(novo);
    setSalvando(true);
    try {
      await api.patch(`/admin/products/${produtoId}/variants/${variante.id}`, { stock: novo });
    } catch {
      setEstoque(anterior);
      alert('Não foi possível alterar o estoque. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (salvando) return;
    if (!confirm(`Remover o tamanho ${variante.size} · ${variante.color} deste produto?`)) return;
    setSalvando(true);
    try {
      await api.delete(`/admin/products/${produtoId}/variants/${variante.id}`);
      aoRemover();
    } catch (err) {
      alert(err.response?.data?.error || 'Não foi possível remover. Tente de novo.');
      setSalvando(false);
    }
  }

  const botao =
    'size-10 shrink-0 rounded-full border border-gray-300 text-xl leading-none disabled:opacity-40';

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        estoque === 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <span className="min-w-0 flex-1 break-words text-sm">
        {variante.size} · {variante.color}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button aria-label="Diminuir estoque" className={botao} disabled={estoque === 0 || salvando} onClick={() => alterar(estoque - 1)}>
          −
        </button>
        <span className="w-7 text-center font-semibold">{estoque}</span>
        <button aria-label="Aumentar estoque" className={botao} disabled={salvando} onClick={() => alterar(estoque + 1)}>
          +
        </button>
      </div>

      {podeRemover && (
        <button
          aria-label="Remover tamanho e cor"
          title="Remover tamanho/cor"
          disabled={salvando}
          onClick={remover}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-50 disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Products() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [params, setParams] = useSearchParams();
  const filtro = params.get('filtro') === 'esgotados' ? 'esgotados' : 'todos';

  function carregar() {
    api
      .get('/products')
      .then((res) => setProdutos(res.data))
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(); }, []);

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const { data } = await api.delete(`/admin/products/${id}`);
      if (data?.ocultado) {
        alert('Esse produto já teve vendas, então não pode ser apagado do histórico. Ele foi ocultado da loja.');
      }
      carregar();
    } catch {
      alert('Não foi possível excluir. Tente de novo.');
    }
  }

  const lista = produtos.filter((p) => (filtro === 'esgotados' ? p.totalEstoque === 0 : true));
  const aba = (ativa) =>
    `px-4 py-2 rounded-full text-sm border ${
      ativa ? 'bg-vinho text-white border-vinho' : 'border-gray-300 text-gray-700 bg-white'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl text-vinho">Produtos</h1>
        <Link
          to="/admin/produtos/novo"
          className="bg-vinho text-white px-4 py-2.5 rounded-full text-sm font-medium"
        >
          + Adicionar
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={aba(filtro === 'todos')} onClick={() => setParams({})}>Todos</button>
        <button className={aba(filtro === 'esgotados')} onClick={() => setParams({ filtro: 'esgotados' })}>
          Esgotados
        </button>
      </div>

      {carregando && <p className="text-gray-500">Carregando…</p>}
      {!carregando && lista.length === 0 && (
        <p className="text-gray-500">
          {filtro === 'esgotados' ? 'Nenhum produto esgotado.' : 'Nenhum produto cadastrado ainda.'}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {lista.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex gap-3">
              <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-rosa">
                {p.images?.[0] && (
                  <img src={imageUrl(p.images[0].url)} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-vinho font-semibold">{money(p.price)}</p>
                <p className="text-xs text-gray-500">
                  {p.category?.name}
                  {p.totalEstoque === 0 && (
                    <span className="ml-2 bg-gray-800 text-white px-2 py-0.5 rounded">Esgotado</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {p.variants.map((v) => (
                <VarianteEstoque
                  key={v.id}
                  produtoId={p.id}
                  variante={v}
                  podeRemover={p.variants.length > 1}
                  aoRemover={carregar}
                />
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                to={`/admin/produtos/${p.id}`}
                className="flex-1 text-center border border-vinho text-vinho rounded-lg py-2.5 font-medium"
              >
                Editar
              </Link>
              <button
                onClick={() => excluir(p.id)}
                className="flex-1 border border-red-300 text-red-600 rounded-lg py-2.5 font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}