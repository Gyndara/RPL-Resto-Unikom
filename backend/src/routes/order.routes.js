const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/order.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Public for customers to create & track orders
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Staff update order status
router.put('/:id', authenticateToken, requireRole('chef', 'pelayan', 'kasir', 'manager'), updateOrderStatus);

module.exports = router;
