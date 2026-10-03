# Diva Moda Plus Size

E-commerce completo (loja + painel administrativo) para venda de roupas plus size,
com controle de estoque por tamanho e cor.

## Estrutura

```
/backend    -> API Node.js + Express + Prisma + PostgreSQL
/frontend   -> React + Vite + Tailwind CSS
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL instalado e rodando (local ou em algum serviço como Railway, Neon, Supabase etc.)

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abra o `.env` e preencha `DATABASE_URL` com os dados reais do seu banco PostgreSQL, e troque `JWT_SECRET`
por uma string aleatória grande.

Criar as tabelas no banco:

```bash
npx prisma migrate dev --name init
```

Criar a admin inicial e categorias padrão:

```bash
npm run seed
```

Isso vai criar um login de admin (o e-mail e senha aparecem no terminal — troque a senha depois de logar).

Rodar o servidor:

```bash
npm run dev
```

A API sobe em `http://localhost:3333`.

## 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O site abre em `http://localhost:5173`.

Painel administrativo: `http://localhost:5173/admin/login`

## O que já está pronto

- Loja: home, catálogo com filtros (categoria/tamanho/busca), página de produto, carrinho, checkout
- Estoque real por tamanho + cor, baixado automaticamente quando um pedido é criado
- Produto esgotado é bloqueado automaticamente para compra
- Painel admin com login (JWT + senha com hash), dashboard, cadastro/edição/exclusão de produtos,
  edição rápida de estoque por variante, gestão de categorias, listagem de pedidos com alteração de status
- Upload real de fotos de produto (salvas em `backend/uploads`, servidas em `/uploads/...`)
- Integração com o Mercado Pago: ao finalizar a compra, o pedido é criado como "Pendente" e o
  cliente é levado direto para a página de pagamento do Mercado Pago; um webhook atualiza o
  status do pedido automaticamente para "Pago" quando o pagamento é aprovado

### Configurando o Mercado Pago

No `.env` do backend, preencha:

```
MERCADOPAGO_ACCESS_TOKEN="seu_access_token_de_producao_ou_teste"
BACKEND_URL="http://localhost:3333"
```

O `access token` fica no painel de desenvolvedores do Mercado Pago (mercadopago.com.br/developers).
Sem essa credencial preenchida, o checkout continua funcionando normalmente e o pedido é criado,
só não gera o link de pagamento (fica como "Pendente" até você mudar o status manualmente no painel).

Para o webhook funcionar em ambiente local, é preciso expor o backend publicamente (ex: com `ngrok`)
e configurar essa URL pública no lugar de `BACKEND_URL`.

## Próximos passos (ainda não incluídos)

- Cálculo de frete real via CEP (hoje o frete é um valor fixo de exemplo em `Checkout.jsx`)
- Refinos visuais (banners de verdade, animações, mais destaque nas fotos)
- Envio de e-mail de confirmação para o cliente
- Paginação no catálogo quando o número de produtos crescer bastante

Me avise qual dessas partes você quer que eu monte a seguir.
