const prisma = require('../config/prisma');

async function processPayment(req, res) {
  try {
    const { id_pesanan, metode_pembayaran, total_pembayaran } = req.body;
    const id_pegawai = req.user.id_pegawai;

    if (!id_pesanan || !metode_pembayaran || !total_pembayaran) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, payment method, and total payment are required',
      });
    }

    const validMethods = ['Cash', 'QRIS', 'Debit'];
    if (!validMethods.includes(metode_pembayaran)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const order = await prisma.pesanan.findUnique({
      where: { id_pesanan: parseInt(id_pesanan) },
      include: { detail: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if already paid
    const existingPayment = await prisma.pembayaran.findUnique({
      where: { id_pesanan: parseInt(id_pesanan) },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid',
      });
    }

    // Create payment transaction
    const payment = await prisma.pembayaran.create({
      data: {
        id_pesanan: parseInt(id_pesanan),
        id_pegawai: parseInt(id_pegawai),
        metode_pembayaran,
        total_pembayaran: parseFloat(total_pembayaran),
      },
      include: {
        pegawai: {
          select: { nama_pegawai: true },
        },
        pesanan: {
          include: {
            meja: true,
            detail: {
              include: { menu: true },
            },
          },
        },
      },
    });

    // Mark order as Completed
    await prisma.pesanan.update({
      where: { id_pesanan: parseInt(id_pesanan) },
      data: { status_pesanan: 'Completed' },
    });

    // Check if table has other unpaid active orders
    const otherUnpaidOrders = await prisma.pesanan.findFirst({
      where: {
        id_meja: order.id_meja,
        status_pesanan: { notIn: ['Completed', 'Cancelled'] },
      },
    });

    if (!otherUnpaidOrders) {
      await prisma.meja.update({
        where: { id_meja: order.id_meja },
        data: { status_meja: 'Available' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getPayments(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.tanggal_pembayaran = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const payments = await prisma.pembayaran.findMany({
      where: whereClause,
      include: {
        pegawai: {
          select: { nama_pegawai: true, username: true },
        },
        pesanan: {
          include: {
            meja: true,
            detail: {
              include: { menu: true },
            },
          },
        },
      },
      orderBy: {
        tanggal_pembayaran: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  processPayment,
  getPayments,
};
