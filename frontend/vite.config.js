import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // host: true deixa o site acessível pelo celular na mesma rede Wi-Fi (endereço "Network" no terminal)
  server: { host: true, port: 5173 },
});
