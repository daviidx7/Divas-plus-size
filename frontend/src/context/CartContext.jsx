import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [itens, setItens] = useState(() => {
    const salvo = localStorage.getItem('diva_carrinho');
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem('diva_carrinho', JSON.stringify(itens));
  }, [itens]);

  function adicionarItem(item) {
    // item: { productId, variantId, name, price, size, color, quantity, image, stockDisponivel }
    setItens((atual) => {
      const existente = atual.find((i) => i.variantId === item.variantId);
      if (existente) {
        return atual.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stockDisponivel) }
            : i
        );
      }
      return [...atual, item];
    });
  }

  function removerItem(variantId) {
    setItens((atual) => atual.filter((i) => i.variantId !== variantId));
  }

  function alterarQuantidade(variantId, quantity) {
    setItens((atual) =>
      atual.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockDisponivel)) }
          : i
      )
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  const subtotal = itens.reduce((soma, i) => soma + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
