require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // ATENÇÃO: troque o e-mail e a senha abaixo antes de rodar em produção
  const email = 'admin@divamodaplussize.com.br';
  const senhaPlana = 'MudeEstaSenha123';
  const senhaHash = await bcrypt.hash(senhaPlana, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { name: 'Administradora', email, password: senhaHash },
  });

  console.log(`Admin criada: ${email} / senha: ${senhaPlana} (troque depois de logar)`);

  const categorias = ['Vestidos', 'Conjuntos', 'Blusas', 'Calças', 'Saias'];
  for (const nome of categorias) {
    await prisma.category.upsert({
      where: { slug: nome.toLowerCase() },
      update: {},
      create: { name: nome, slug: nome.toLowerCase() },
    });
  }

  console.log('Categorias iniciais criadas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
