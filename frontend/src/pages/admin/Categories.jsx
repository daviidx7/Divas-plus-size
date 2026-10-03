import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');

  function carregar() {
    api.get('/categories').then((res) => setCategorias(res.data));
  }

  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (!nome.trim()) return;

    try {
      if (editandoId) {
        await api.put(`/admin/categories/${editandoId}`, { name: nome });
      } else {
        await api.post('/admin/categories', { name: nome });
      }
      setNome('');
      setEditandoId(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar categoria.');
    }
  }

  function editar(categoria) {
    setEditandoId(categoria.id);
    setNome(categoria.name);
  }

  async function excluir(id) {
    if (!confirm('Excluir esta categoria? Produtos vinculados a ela podem ser afetados.')) return;
    await api.delete(`/admin/categories/${id}`);
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl text-vinho mb-6">Categorias</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-2 max-w-md">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da categoria"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base"
        />
        <button className="bg-vinho text-white px-5 py-3 rounded-lg font-medium hover:bg-vinho/90">
          {editandoId ? 'Salvar' : 'Adicionar'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={() => { setEditandoId(null); setNome(''); }}
            className="px-3 py-2 text-sm text-gray-500"
          >
            Cancelar
          </button>
        )}
      </form>

      {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}

      <div className="bg-white rounded-xl shadow-sm max-w-md">
        {categorias.map((c) => (
          <div key={c.id} className="flex justify-between items-center gap-3 px-4 py-3 border-b last:border-0">
            <span>{c.name}</span>
            <div className="space-x-4 text-base shrink-0">
              <button onClick={() => editar(c)} className="text-vinho hover:underline">Editar</button>
              <button onClick={() => excluir(c.id)} className="text-red-600 hover:underline">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
