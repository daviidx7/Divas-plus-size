const prisma = require('../config/prisma');

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listar(req, res, next) {
  try {
    const categorias = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return res.json(categorias);
  } catch (err) {
    return next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

    const categoria = await prisma.category.create({
      data: { name, slug: slugify(name) },
    });

    return res.status(201).json(categoria);
  } catch (err) {
    return next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { name } = req.body;
    const categoria = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, slug: name ? slugify(name) : undefined },
    });
    return res.json(categoria);
  } catch (err) {
    return next(err);
  }
}

async function excluir(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, criar, atualizar, excluir };
