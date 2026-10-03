import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const campo =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-vinho';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      localStorage.setItem('diva_admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setErro(
        err.response?.data?.error ||
          'Não foi possível entrar. Confira sua internet e tente de novo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-rosa flex items-center justify-center px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm">
        <h1 className="font-titulo text-3xl text-vinho font-bold text-center">Diva Moda Plus Size</h1>
        <p className="text-center text-gray-600 mt-1 mb-6">Painel da loja</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <label className="block font-medium">
            E-mail
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${campo} mt-1`}
            />
          </label>

          <label className="block font-medium">
            Senha
            <div className="relative mt-1">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${campo} pr-24`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-vinho"
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
              {erro}
            </p>
          )}

          <button
            disabled={enviando}
            className="w-full bg-vinho text-white py-3.5 rounded-full font-medium text-base disabled:opacity-60"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <Link to="/" className="block text-center text-vinho underline mt-5 py-2">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
