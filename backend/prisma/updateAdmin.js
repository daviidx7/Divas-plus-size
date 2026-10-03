require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ATENÇÃO: preencha aqui o e-mail e a senha novos antes de rodar.
const EMAIL_ANTIGO = 'admin@divamodaplussize.com.br'; // login criado pelo seed original
const NOVO_EMAIL = 'Divasmodaplus12345@gmail.com';
const NOVA_SENHA = 'Daniela23.';

async function main() {
  const senhaHash = await bcrypt.hash(NOVA_SENHA, 10);

  const existente = await prisma.admin.findUnique({ where: { email: EMAIL_ANTIGO } });

  if (existente) {
    await prisma.admin.update({
      where: { email: EMAIL_ANTIGO },
      data: { email: NOVO_EMAIL, password: senhaHash },
    });
    console.log(`Login atualizado! Agora entre com: ${NOVO_EMAIL}`);
  } else {
    await prisma.admin.upsert({
      where: { email: NOVO_EMAIL },
      update: { password: senhaHash },
      create: { name: 'Administradora', email: NOVO_EMAIL, password: senhaHash },
    });
    console.log(`Admin criada/atualizada: ${NOVO_EMAIL}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
