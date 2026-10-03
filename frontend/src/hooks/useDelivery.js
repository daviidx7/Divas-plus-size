import { useEffect, useState } from 'react';
import api from '../services/api';

// Opções de entrega/retirada vindas do servidor (valor do frete e regiões atendidas).
// O valor fica guardado depois da primeira busca, então várias telas podem usar sem repetir.
let cache = null;

export default function useDelivery() {
  const [dados, setDados] = useState(cache);

  useEffect(() => {
    if (cache) return;
    api
      .get('/delivery')
      .then((res) => {
        cache = res.data;
        setDados(res.data);
      })
      .catch(() => {});
  }, []);

  return dados; // null enquanto carrega (ou se o servidor estiver fora do ar)
}
