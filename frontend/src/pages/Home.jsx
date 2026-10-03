import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.get('/products').then((res) => {
      const produtos = res.data;
      const marcados = produtos.filter((p) => p.destaque).slice(0, 4);
      setDestaques(marcados);

      // Novidades = mais recentes, sem repetir o que já apareceu em Destaques
      const idsDestaque = new Set(marcados.map((p) => p.id));
      setRecentes(produtos.filter((p) => !idsDestaque.has(p.id)).slice(0, 8));
    });
    api.get('/categories').then((res) => setCategorias(res.data));
  }, []);

  return (
    <div>
      <section className="bg-rosa">
        <div className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl text-vinho font-bold leading-tight">
              Moda plus size com elegância e atitude
            </h1>
            <p className="mt-4 text-gray-600">
              Peças pensadas para valorizar cada curva, com caimento perfeito e estilo autêntico.
            </p>
            <Link
              to="/catalogo"
              className="inline-block mt-6 bg-vinho text-white px-6 py-3 rounded-full font-medium hover:bg-vinho/90"
            >
              Ver coleção
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl text-vinho mb-6">Categorias</h2>
        <div className="flex flex-wrap gap-3">
          {categorias.map((c) => (
            <Link
              key={c.id}
              to={`/catalogo?categoria=${c.slug}`}
              className="px-5 py-2 rounded-full border border-vinho text-vinho hover:bg-vinho hover:text-white transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl text-vinho mb-6">Produtos em destaque</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destaques.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl text-vinho mb-6">Novidades</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recentes.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
