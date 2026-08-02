const express = require('express');
const router = express.Router();
const { getTables, getTableById, createTable, updateTableStatus } = require('../controllers/table.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', getTables);
router.get('/:id', getTableById);
router.post('/', authenticateToken, requireRole('manager', 'pelayan'), createTable);
router.put('/:id', authenticateToken, requireRole('manager', 'pelayan', 'kasir'), updateTableStatus);

module.exports = router;
