const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/categories', categoryController.listar);
router.post('/admin/categories', authMiddleware, categoryController.criar);
router.put('/admin/categories/:id', authMiddleware, categoryController.atualizar);
router.delete('/admin/categories/:id', authMiddleware, categoryController.excluir);

module.exports = router;
