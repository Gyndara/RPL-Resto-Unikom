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

async function register(req, res) {
  try {
    const { nama_pegawai, username, password, role } = req.body;

    if (!nama_pegawai || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Semua field (nama pegawai, username, password, role) wajib diisi',
      });
    }

    const validRoles = ['kasir', 'pelayan', 'chef', 'manager'];
    const normalizedRole = role.toLowerCase().trim();

    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid. Pilih antara kasir, pelayan, atau chef',
      });
    }

    const existingPegawai = await prisma.pegawai.findUnique({
      where: { username: username.trim() },
    });

    if (existingPegawai) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan, silakan pilih username lain',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPegawai = await prisma.pegawai.create({
      data: {
        nama_pegawai: nama_pegawai.trim(),
        username: username.trim(),
        password: hashedPassword,
        role: normalizedRole,
      },
      select: {
        id_pegawai: true,
        nama_pegawai: true,
        username: true,
        role: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Akun pegawai berhasil dibuat',
      data: newPegawai,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllStaff(req, res) {
  try {
    const staff = await prisma.pegawai.findMany({
      select: {
        id_pegawai: true,
        nama_pegawai: true,
        username: true,
        role: true,
      },
      orderBy: { id_pegawai: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    const id_pegawai = parseInt(id, 10);

    if (isNaN(id_pegawai)) {
      return res.status(400).json({
        success: false,
        message: 'ID Pegawai tidak valid',
      });
    }

    if (req.user && req.user.id_pegawai === id_pegawai) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun Anda sendiri',
      });
    }

    await prisma.pegawai.delete({
      where: { id_pegawai },
    });

    return res.status(200).json({
      success: true,
      message: 'Akun pegawai berhasil dihapus',
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
  register,
  getAllStaff,
  deleteStaff,
};

