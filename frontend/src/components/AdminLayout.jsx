import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Início', icone: 'casa' },
  { to: '/admin/produtos', label: 'Produtos', icone: 'caixa' },
  { to: '/admin/categorias', label: 'Categorias', icone: 'etiqueta' },
  { to: '/admin/pedidos', label: 'Pedidos', icone: 'recibo' },
];

function Icone({ nome }) {
  const caminhos = {
    casa: <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z" />,
    caixa: (
      <>
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </>
    ),
    etiqueta: (
      <>
        <path d="M3 4h8l10 10-7 7L4 11V4z" />
        <circle cx="8" cy="8" r="1.3" />
      </>
    ),
    recibo: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      {caminhos[nome]}
    </svg>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function sair() {
    localStorage.removeItem('diva_admin_token');
    navigate('/admin/login');
  }

  const ativo = (to) => (to === '/admin' ? pathname === '/admin' : pathname.startsWith(to));

  return (
    <div className="min-h-dvh bg-gray-50 md:flex">
      {/* Menu lateral: computador e tablet */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-vinho text-white sticky top-0 h-dvh">
        <div className="p-5 font-titulo text-lg border-b border-white/10">Diva Moda · Painel</div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                ativo(l.to) ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icone nome={l.icone} />
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="mx-3 px-3 py-2 text-sm text-white/80 hover:text-white">
          Ver a loja
        </Link>
        <button onClick={sair} className="m-3 mt-0 px-3 py-2 text-left text-sm text-white/80 hover:text-white">
          Sair
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Barra do topo: celular */}
        <header className="md:hidden sticky top-0 z-30 bg-vinho text-white flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="font-titulo text-lg">Diva Moda · Painel</span>
          <div className="flex items-center gap-1 text-sm">
            <Link to="/" className="px-2 py-2 text-white/80">Ver loja</Link>
            <button onClick={sair} className="px-2 py-2 underline underline-offset-2">Sair</button>
          </div>
        </header>

        <main className="p-4 pb-28 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Menu de baixo: celular (fácil de tocar com o polegar) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
              ativo(l.to) ? 'text-vinho font-semibold' : 'text-gray-500'
            }`}
          >
            <Icone nome={l.icone} />
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
