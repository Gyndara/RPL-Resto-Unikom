const express = require('express');
const router = express.Router();
const { login, getProfile, register, getAllStaff, deleteStaff } = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// Manager staff management routes
router.post('/register', authenticateToken, requireRole('manager'), register);
router.get('/staff', authenticateToken, requireRole('manager'), getAllStaff);
router.delete('/staff/:id', authenticateToken, requireRole('manager'), deleteStaff);

module.exports = router;

