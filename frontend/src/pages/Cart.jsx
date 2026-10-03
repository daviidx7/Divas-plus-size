import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { imageUrl } from '../services/api';

export default function Cart() {
  const { itens, removerItem, alterarQuantidade, subtotal } = useCart();
  const navigate = useNavigate();

  if (itens.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-vinho mb-4">Seu carrinho está vazio</h1>
        <Link to="/catalogo" className="text-vinho underline">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-vinho mb-6">Carrinho de compras</h1>

      <div className="space-y-4">
        {itens.map((item) => (
          <div key={item.variantId} className="flex gap-4 border-b pb-4">
            <img src={imageUrl(item.image)} alt={item.name} className="w-20 h-24 object-cover rounded" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Tamanho {item.size} · Cor {item.color}</p>
              <p className="text-vinho font-semibold mt-1">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  max={item.stockDisponivel}
                  value={item.quantity}
                  onChange={(e) => alterarQuantidade(item.variantId, Number(e.target.value))}
                  className="w-20 border border-gray-300 rounded-lg px-2 py-2"
                />
                <button
                  onClick={() => removerItem(item.variantId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <p className="text-xl font-semibold">Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}</p>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full sm:w-auto bg-vinho text-white px-6 py-3.5 rounded-full font-medium hover:bg-vinho/90"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
