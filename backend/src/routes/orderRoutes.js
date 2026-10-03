const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Público: opções de entrega/retirada (valor do frete, regiões atendidas)
router.get('/delivery', orderController.opcoesEntrega);

// Checkout público
router.post('/orders', orderController.criar);

// Administrativo
router.get('/admin/orders', authMiddleware, orderController.listar);
router.get('/admin/orders/:id', authMiddleware, orderController.buscarPorId);
router.patch('/admin/orders/:id/status', authMiddleware, orderController.atualizarStatus);

module.exports = router;
