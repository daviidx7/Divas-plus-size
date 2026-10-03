const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rotas públicas (catálogo da loja)
router.get('/products', productController.listar);
router.get('/products/:id', productController.buscarPorId);

// Rotas administrativas (protegidas)
router.post('/admin/products', authMiddleware, productController.criar);
router.put('/admin/products/:id', authMiddleware, productController.atualizar);
router.delete('/admin/products/:id', authMiddleware, productController.excluir);
router.post('/admin/products/:id/variants', authMiddleware, productController.adicionarVariante);
router.patch(
  '/admin/products/:id/variants/:variantId',
  authMiddleware,
  productController.atualizarEstoqueVariante
);
router.delete(
  '/admin/products/:id/variants/:variantId',
  authMiddleware,
  productController.removerVariante
);

module.exports = router;