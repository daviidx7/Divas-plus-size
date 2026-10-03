import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const links = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/catalogo?novidades=true', label: 'Novidades' },
];

export default function Header() {
  const { itens } = useCart();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const totalItens = itens.reduce((soma, i) => soma + i.quantity, 0);

  function handleBusca(e) {
    e.preventDefault();
    navigate(`/catalogo?busca=${encodeURIComponent(busca)}`);
    setMenuAberto(false);
  }

  const formBusca = (
    <form onSubmit={handleBusca} className="flex w-full">
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar produtos..."
        className="min-w-0 flex-1 border border-gray-300 rounded-l-lg px-3 py-2.5 focus:outline-none focus:border-vinho"
      />
      <button type="submit" className="bg-vinho text-white px-4 rounded-r-lg">
        Buscar
      </button>
    </form>
  );

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="min-w-0 font-titulo text-xl sm:text-2xl text-vinho font-bold leading-tight"
          >
            Diva Moda Plus Size
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-vinho">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex flex-1 max-w-xs">{formBusca}</div>

          <div className="flex items-center gap-1 shrink-0">
            <Link to="/carrinho" aria-label="Carrinho" className="relative p-2 text-vinho">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {totalItens > 0 && (
                <span className="absolute top-0 right-0 bg-dourado text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItens}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="md:hidden p-2 text-vinho"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                {menuAberto ? (
                  <>
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="md:hidden border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
            {formBusca}
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuAberto(false)}
                  className="py-3 border-b border-gray-100 text-base text-gray-800"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
