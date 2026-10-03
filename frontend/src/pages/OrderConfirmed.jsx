import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useDelivery from '../hooks/useDelivery.js';
import WhatsAppIcon from '../components/WhatsAppIcon.jsx';
import { whatsappLink } from '../config/store.js';

export default function OrderConfirmed() {
  const { state } = useLocation();
  const delivery = useDelivery();
  const retirada = state?.tipo === 'RETIRADA';

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl text-vinho mb-4">Pedido realizado com sucesso!</h1>
      <p className="text-gray-600 mb-4">
        Assim que o pagamento for confirmado, você receberá as atualizações.
      </p>

      {retirada && delivery && (
        <p className="rounded-lg bg-rosa text-vinho px-4 py-3 mb-6 text-sm">{delivery.pickupInfo}</p>
      )}

      <a
        href={whatsappLink('Olá! Acabei de fazer um pedido no site da Diva Moda Plus Size.')}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#25D366] text-white px-6 py-3 rounded-full font-medium"
      >
        <WhatsAppIcon className="w-5 h-5" />
        Falar com a loja no WhatsApp
      </a>

      <div className="mt-6">
        <Link to="/" className="text-vinho underline">Voltar para a loja</Link>
      </div>
    </div>
  );
}
