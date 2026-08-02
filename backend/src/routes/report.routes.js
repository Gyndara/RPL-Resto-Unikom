const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, requireRole('kasir', 'manager'), getReports);

module.exports = router;
