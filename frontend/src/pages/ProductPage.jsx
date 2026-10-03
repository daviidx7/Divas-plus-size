import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import useDelivery from '../hooks/useDelivery.js';
import WhatsAppIcon from '../components/WhatsAppIcon.jsx';
import { money } from '../utils/format.js';
import { whatsappLink } from '../config/store.js';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCart();
  const delivery = useDelivery();

  const [produto, setProduto] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduto(res.data))
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  if (naoEncontrado) {
    return <div className="max-w-4xl mx-auto px-4 py-10">Produto não encontrado.</div>;
  }
  if (!produto) return <div className="max-w-4xl mx-auto px-4 py-10">Carregando...</div>;

  const tamanhos = [...new Set(produto.variants.map((v) => v.size))];
  const cores = [...new Set(produto.variants.map((v) => v.color))];
  const totalEstoque = produto.variants.reduce((soma, v) => soma + v.stock, 0);
  const esgotado = totalEstoque === 0;

  const temEstoque = (campo, valor) =>
    produto.variants.some((v) => v[campo] === valor && v.stock > 0);

  const varianteSelecionada = produto.variants.find((v) => v.size === tamanho && v.color === cor);
  const maxQuantidade = varianteSelecionada?.stock || 1;

  function handleAdicionar() {
    if (!tamanho || !cor) {
      setMensagem('Selecione o tamanho e a cor.');
      return;
    }
    if (!varianteSelecionada || varianteSelecionada.stock < 1) {
      setMensagem('Essa combinação está esgotada.');
      return;
    }

    adicionarItem({
      productId: produto.id,
      variantId: varianteSelecionada.id,
      name: produto.name,
      price: Number(produto.price),
      size: tamanho,
      color: cor,
      quantity: Math.min(Math.max(1, quantidade), varianteSelecionada.stock),
      image: produto.images?.[0]?.url,
      stockDisponivel: varianteSelecionada.stock,
    });

    navigate('/carrinho');
  }

  const opcao = (ativo, indisponivel) =>
    `min-w-11 h-11 px-3 rounded-lg border text-base ${
      ativo ? 'bg-vinho text-white border-vinho' : 'border-gray-300'
    } ${indisponivel ? 'opacity-40 line-through' : ''}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 grid gap-8 md:grid-cols-2">
      <div>
        <div className="aspect-[4/5] bg-rosa rounded-lg overflow-hidden">
          {produto.images?.[imagemAtual] ? (
            <img
              src={imageUrl(produto.images[imagemAtual].url)}
              alt={produto.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-vinho/60">Sem foto</div>
          )}
        </div>
        {produto.images?.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {produto.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setImagemAtual(i)}
                className={`w-16 h-16 shrink-0 rounded overflow-hidden border-2 ${
                  i === imagemAtual ? 'border-vinho' : 'border-transparent'
                }`}
              >
                <img src={imageUrl(img.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl text-vinho font-bold">{produto.name}</h1>
        <p className="text-2xl text-vinho mt-2">{money(produto.price)}</p>
        <p className="text-gray-600 mt-4 whitespace-pre-line">{produto.description}</p>

        {esgotado ? (
          <p className="mt-6 rounded-lg bg-gray-100 text-gray-700 px-4 py-3 font-medium">
            Esgotado no momento.
          </p>
        ) : (
          <>
            <div className="mt-6">
              <p className="font-medium mb-2">Tamanho</p>
              <div className="flex gap-2 flex-wrap">
                {tamanhos.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTamanho(t); setQuantidade(1); setMensagem(''); }}
                    className={opcao(tamanho === t, !temEstoque('size', t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-medium mb-2">Cor</p>
              <div className="flex gap-2 flex-wrap">
                {cores.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCor(c); setQuantidade(1); setMensagem(''); }}
                    className={opcao(cor === c, !temEstoque('color', c))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {tamanho && cor && (
              <p className="mt-3 text-sm text-gray-500">
                {varianteSelecionada && varianteSelecionada.stock > 0
                  ? `${varianteSelecionada.stock} em estoque`
                  : 'Essa combinação está esgotada'}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <span className="font-medium">Quantidade</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  aria-label="Diminuir"
                  className="w-11 h-11 text-xl"
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center">{quantidade}</span>
                <button
                  type="button"
                  aria-label="Aumentar"
                  className="w-11 h-11 text-xl"
                  onClick={() => setQuantidade((q) => Math.min(maxQuantidade, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {mensagem && <p className="text-red-600 text-sm mt-3">{mensagem}</p>}

            <button
              onClick={handleAdicionar}
              className="mt-6 w-full bg-vinho text-white py-3.5 rounded-full font-medium text-base hover:bg-vinho/90"
            >
              Adicionar ao carrinho
            </button>
          </>
        )}

        <a
          href={whatsappLink(`Olá! Tenho interesse na peça "${produto.name}". Ainda está disponível?`)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full border border-green-600 text-green-700 py-3 rounded-full font-medium"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Tirar dúvida no WhatsApp
        </a>

        {delivery && (
          <div className="mt-6 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
            <p className="font-semibold text-vinho mb-1">Entrega e retirada</p>
            <p>Motoboy (Taguatinga, Ceilândia, Samambaia): {money(delivery.motoboyFee)}</p>
            <p>Correios (todo o Brasil): {money(delivery.correiosFee)}</p>
            <p>Retirada na loja: sem custo</p>
          </div>
        )}
      </div>
    </div>
  );
}
