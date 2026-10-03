const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/admin/dashboard', authMiddleware, dashboardController.resumo);

module.exports = router;
