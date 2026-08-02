const express = require('express');
const router = express.Router();
const { processPayment, getPayments } = require('../controllers/payment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, requireRole('kasir', 'manager'), processPayment);
router.get('/', authenticateToken, requireRole('kasir', 'manager'), getPayments);

module.exports = router;
