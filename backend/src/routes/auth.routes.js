const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
