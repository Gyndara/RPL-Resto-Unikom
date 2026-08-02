const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const pegawai = await prisma.pegawai.findUnique({
      where: { username },
    });

    if (!pegawai) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, pegawai.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = jwt.sign(
      {
        id_pegawai: pegawai.id_pegawai,
        nama_pegawai: pegawai.nama_pegawai,
        username: pegawai.username,
        role: pegawai.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        pegawai: {
          id_pegawai: pegawai.id_pegawai,
          nama_pegawai: pegawai.nama_pegawai,
          username: pegawai.username,
          role: pegawai.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getProfile(req, res) {
  try {
    const pegawai = await prisma.pegawai.findUnique({
      where: { id_pegawai: req.user.id_pegawai },
      select: {
        id_pegawai: true,
        nama_pegawai: true,
        username: true,
        role: true,
      },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: pegawai,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  login,
  getProfile,
};
