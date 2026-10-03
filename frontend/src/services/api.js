import axios from 'axios';

// Endereço da API. Sem VITE_API_URL, usa o mesmo endereço em que o site foi aberto (porta 3333).
// Assim funciona no computador (localhost) e também no celular pela rede Wi-Fi.
const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3333/api`;

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// As fotos são salvas como "/uploads/arquivo.jpg". Aqui viram o endereço completo.
export function imageUrl(url) {
  if (!url) return '';
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}

const api = axios.create({ baseURL: API_URL });

// Anexa o token do admin automaticamente quando existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('diva_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o login do painel expirou, volta para a tela de login em vez de mostrar telas vazias
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const caminho = window.location.pathname;
    if (
      err.response?.status === 401 &&
      caminho.startsWith('/admin') &&
      !caminho.startsWith('/admin/login')
    ) {
      localStorage.removeItem('diva_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
