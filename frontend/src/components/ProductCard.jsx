import React from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../services/api';
import { money } from '../utils/format.js';

export default function ProductCard({ produto }) {
  const foto = produto.images?.[0]?.url;
  const esgotado = produto.totalEstoque === 0;

  return (
    <Link
      to={`/produto/${produto.id}`}
      className="group block rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition"
    >
      <div className="relative aspect-[4/5] bg-rosa overflow-hidden">
        {foto ? (
          <img
            src={imageUrl(foto)}
            alt={produto.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-vinho/60 text-sm">
            Sem foto
          </div>
        )}
        {esgotado && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Esgotado
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{produto.name}</h3>
        <p className="text-vinho font-semibold mt-1">{money(produto.price)}</p>
      </div>
    </Link>
  );
}
