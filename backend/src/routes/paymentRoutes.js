const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/payments/preference/:orderId', paymentController.criarPreferencia);
router.post('/payments/webhook', paymentController.webhook);

module.exports = router;
