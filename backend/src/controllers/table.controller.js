const prisma = require('../config/prisma');

async function getTables(req, res) {
  try {
    const { status } = req.query;
    const whereClause = status ? { status_meja: status } : {};

    const tables = await prisma.meja.findMany({
      where: whereClause,
      include: {
        pesanan: {
          where: {
            status_pesanan: {
              notIn: ['Completed', 'Cancelled'],
            },
          },
          select: {
            id_pesanan: true,
            nama_pelanggan: true,
            tanggal_pesanan: true,
            status_pesanan: true,
            detail: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
      orderBy: {
        id_meja: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getTableById(req, res) {
  try {
    const { id } = req.params;
    const table = await prisma.meja.findUnique({
      where: { id_meja: parseInt(id) },
      include: {
        pesanan: {
          where: {
            status_pesanan: {
              notIn: ['Completed', 'Cancelled'],
            },
          },
          include: {
            detail: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createTable(req, res) {
  try {
    const { nama_meja, kapasitas } = req.body;

    if (!nama_meja || !kapasitas) {
      return res.status(400).json({
        success: false,
        message: 'Table name and capacity are required',
      });
    }

    const newTable = await prisma.meja.create({
      data: {
        nama_meja,
        kapasitas: parseInt(kapasitas),
        status_meja: 'Available',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: newTable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateTableStatus(req, res) {
  try {
    const { id } = req.params;
    const { status_meja } = req.body;

    const validStatuses = ['Available', 'Ordering', 'Dining'];
    if (!validStatuses.includes(status_meja)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table status',
      });
    }

    const updatedTable = await prisma.meja.update({
      where: { id_meja: parseInt(id) },
      data: { status_meja },
    });

    return res.status(200).json({
      success: true,
      message: 'Table status updated',
      data: updatedTable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTableStatus,
};
