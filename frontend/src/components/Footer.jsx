import React from 'react';
import WhatsAppIcon from './WhatsAppIcon.jsx';
import useDelivery from '../hooks/useDelivery.js';
import { money } from '../utils/format.js';
import { WHATSAPP_DISPLAY, whatsappLink } from '../config/store.js';

export default function Footer() {
  const delivery = useDelivery();

  return (
    <footer className="bg-vinho text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-titulo text-xl mb-2">Diva Moda Plus Size</h3>
          <p className="text-sm text-white/80">Moda plus size com elegância e atitude.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Entrega e retirada</h4>
          <ul className="text-sm text-white/80 space-y-1">
            <li>Motoboy (Taguatinga, Ceilândia, Samambaia){delivery ? `: ${money(delivery.motoboyFee)}` : ''}</li>
            <li>Correios (todo o Brasil){delivery ? `: ${money(delivery.correiosFee)}` : ''}</li>
            <li>Retirada na loja: sem custo</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Contato</h4>
          <a
            href={whatsappLink('Olá! Vim pelo site da Diva Moda Plus Size.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <WhatsAppIcon className="w-5 h-5" />
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-white/60 py-4 pb-24 sm:pb-4 border-t border-white/10">
        © {new Date().getFullYear()} Diva Moda Plus Size. Todos os direitos reservados.
      </div>

      {/* Botão flutuante do WhatsApp (aparece em todas as telas da loja) */}
      <a
        href={whatsappLink('Olá! Vim pelo site da Diva Moda Plus Size.')}
        target="_blank"
        rel="noreferrer"
        aria-label="Fale conosco no WhatsApp"
        className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <WhatsAppIcon className="w-8 h-8" />
      </a>
    </footer>
  );
}
