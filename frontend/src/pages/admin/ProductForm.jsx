import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { imageUrl } from '../../services/api';
import { compressImage } from '../../utils/image.js';

const TAMANHOS = ['G', 'GG', 'G1', 'G2', 'G3', 'G4'];
const novaVariante = () => ({ size: 'G', color: '', stock: 0 });

const campo =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:border-vinho';

export default function ProductForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', destaque: false });
  const [imagens, setImagens] = useState([]); // caminhos das fotos já enviadas
  const [enviandoFotos, setEnviandoFotos] = useState(0); // quantas fotos estão subindo agora
  const [variantes, setVariantes] = useState([novaVariante()]);
  const [erro, setErro] = useState('');
  const [erroFoto, setErroFoto] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategorias(res.data));

    if (editando) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: p.categoryId,
          destaque: Boolean(p.destaque),
        });
        setImagens(p.images.map((i) => i.url));
        setVariantes(
          p.variants.length
            ? p.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))
            : [novaVariante()]
        );
      });
    }
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  // Envia uma ou várias fotos escolhidas na galeria/câmera do celular
  async function handleFotos(arquivos) {
    setErroFoto('');
    for (const arquivo of arquivos) {
      setEnviandoFotos((n) => n + 1);
      try {
        let conteudo = arquivo;
        try {
          conteudo = await compressImage(arquivo); // reduz o peso da foto
        } catch {
          // se o navegador não conseguir reduzir, envia a original
        }
        const dados = new FormData();
        dados.append('image', conteudo, 'foto.jpg');
        const { data } = await api.post('/admin/upload', dados);
        setImagens((atuais) => [...atuais, data.url]);
      } catch (err) {
        setErroFoto(err.response?.data?.error || 'Não foi possível enviar uma das fotos. Tente de novo.');
      } finally {
        setEnviandoFotos((n) => n - 1);
      }
    }
  }

  function removerFoto(indice) {
    setImagens((atuais) => atuais.filter((_, i) => i !== indice));
  }

  function atualizarVariante(indice, campoNome, valor) {
    setVariantes((atuais) =>
      atuais.map((v, i) => (i === indice ? { ...v, [campoNome]: valor } : v))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (enviandoFotos > 0) {
      setErro('Aguarde as fotos terminarem de enviar.');
      return;
    }
    if (imagens.length === 0) {
      setErro('Adicione pelo menos uma foto da peça.');
      return;
    }
    if (!variantes.some((v) => v.color.trim())) {
      setErro('Informe pelo menos uma cor, com o tamanho e a quantidade em estoque.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        ...form,
        images: imagens,
        variants: variantes.filter((v) => v.color.trim()),
      };

      if (editando) {
        await api.put(`/admin/products/${id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      navigate('/admin/produtos');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar o produto. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl text-vinho">{editando ? 'Editar produto' : 'Novo produto'}</h1>
        <Link to="/admin/produtos" className="text-sm text-vinho underline">Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-5">
        <label className="block font-medium">
          Nome da peça
          <input name="name" required value={form.name} onChange={handleChange} className={`${campo} mt-1`} />
        </label>

        <label className="block font-medium">
          Descrição
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange} className={`${campo} mt-1`} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block font-medium">
            Preço (R$)
            <input
              name="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={handleChange}
              className={`${campo} mt-1`}
            />
          </label>

          <label className="block font-medium">
            Categoria
            <select name="categoryId" required value={form.categoryId} onChange={handleChange} className={`${campo} mt-1`}>
              <option value="">Selecione</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            name="destaque"
            checked={form.destaque}
            onChange={handleChange}
            className="w-5 h-5 accent-vinho"
          />
          Mostrar na seção "Destaques" da página inicial
        </label>

        <div>
          <p className="font-medium mb-2">Fotos</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {imagens.map((url, i) => (
              <div key={url} className="relative aspect-[4/5] rounded-lg overflow-hidden border">
                <img src={imageUrl(url)} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-vinho text-white text-[10px] px-1.5 py-0.5 rounded">
                    Capa
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={() => removerFoto(i)}
                  className="absolute top-1 right-1 size-8 rounded-full bg-black/60 text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}

            {Array.from({ length: enviandoFotos }).map((_, i) => (
              <div
                key={`enviando-${i}`}
                className="aspect-[4/5] rounded-lg border border-dashed flex items-center justify-center text-xs text-gray-500 text-center px-1"
              >
                Enviando…
              </div>
            ))}

            <label className="aspect-[4/5] rounded-lg border-2 border-dashed border-vinho/40 flex flex-col items-center justify-center text-vinho cursor-pointer text-center text-sm px-1">
              <span className="text-3xl leading-none">+</span>
              Adicionar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const arquivos = Array.from(e.target.files);
                  e.target.value = '';
                  handleFotos(arquivos);
                }}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">A primeira foto é a capa que aparece no catálogo.</p>
          {erroFoto && <p role="alert" className="text-red-600 text-sm mt-2">{erroFoto}</p>}
        </div>

        <div>
          <p className="font-medium mb-2">Tamanhos, cores e estoque</p>
          <div className="space-y-3">
            {variantes.map((v, i) => (
              <div key={v.id || `nova-${i}`} className="rounded-lg border p-3 grid grid-cols-2 gap-3">
                <label className="col-span-2 text-sm text-gray-600">
                  Cor
                  <input
                    value={v.color}
                    onChange={(e) => atualizarVariante(i, 'color', e.target.value)}
                    placeholder="Ex.: Marrom"
                    className={`${campo} mt-1`}
                  />
                </label>
                <label className="text-sm text-gray-600">
                  Tamanho
                  <select
                    value={v.size}
                    onChange={(e) => atualizarVariante(i, 'size', e.target.value)}
                    className={`${campo} mt-1`}
                  >
                    {TAMANHOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="text-sm text-gray-600">
                  Estoque
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={v.stock}
                    onChange={(e) => atualizarVariante(i, 'stock', e.target.value)}
                    className={`${campo} mt-1`}
                  />
                </label>
                {!v.id && variantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariantes((atuais) => atuais.filter((_, idx) => idx !== i))}
                    className="col-span-2 text-left text-sm text-red-600 py-1"
                  >
                    Remover este tamanho/cor
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVariantes((atuais) => [...atuais, novaVariante()])}
            className="mt-3 text-vinho font-medium py-2"
          >
            + Adicionar outro tamanho/cor
          </button>
          {editando && (
            <p className="text-xs text-gray-500">
              Para tirar um tamanho/cor que já existe, deixe o estoque dele em 0.
            </p>
          )}
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
            {erro}
          </p>
        )}

        <button
          disabled={salvando || enviandoFotos > 0}
          className="w-full sm:w-auto bg-vinho text-white px-8 py-3.5 rounded-full font-medium text-base disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : enviandoFotos > 0 ? 'Enviando fotos…' : 'Salvar produto'}
        </button>
      </form>
    </div>
  );
}