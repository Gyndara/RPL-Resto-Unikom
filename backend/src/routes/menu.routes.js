const express = require('express');
const router = express.Router();
const { getMenus, getMenuById, createMenu, updateMenu, deleteMenu } = require('../controllers/menu.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', authenticateToken, requireRole('chef', 'manager'), upload.single('gambar'), createMenu);
router.put('/:id', authenticateToken, requireRole('chef', 'manager'), upload.single('gambar'), updateMenu);
router.delete('/:id', authenticateToken, requireRole('chef', 'manager'), deleteMenu);

module.exports = router;
