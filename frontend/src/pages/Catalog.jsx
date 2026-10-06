import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard.jsx';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const categoria = searchParams.get('categoria') || '';
  const tamanho = searchParams.get('tamanho') || '';
  const busca = searchParams.get('busca') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategorias(res.data));
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = {};
    if (categoria) params.categoria = categoria;
    if (tamanho) params.tamanho = tamanho;
    if (busca) params.busca = busca;

    api.get('/products', { params }).then((res) => {
      setProdutos(res.data);
      setCarregando(false);
    });
  }, [categoria, tamanho, busca]);

  function atualizarFiltro(chave, valor) {
    const novo = new URLSearchParams(searchParams);
    if (valor) novo.set(chave, valor);
    else novo.delete(chave);
    setSearchParams(novo);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-vinho mb-6">Catálogo</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={categoria}
          onChange={(e) => atualizarFiltro('categoria', e.target.value)}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2.5 text-base"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          value={tamanho}
          onChange={(e) => atualizarFiltro('tamanho', e.target.value)}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2.5 text-base"
        >
          <option value="">Todos os tamanhos</option>
          {['G', 'GG', 'G1', 'G2', 'G3', 'G4'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </div>
  );
}