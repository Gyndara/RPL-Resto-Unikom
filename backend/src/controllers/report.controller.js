const prisma = require('../config/prisma');

async function getReports(req, res) {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly

    const now = new Date();
    let startDate = new Date();

    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // default: daily (today)
      startDate.setHours(0, 0, 0, 0);
    }

    // Fetch payments within period
    const payments = await prisma.pembayaran.findMany({
      where: {
        tanggal_pembayaran: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        pesanan: {
          include: {
            detail: {
              include: { menu: true },
            },
          },
        },
      },
      orderBy: {
        tanggal_pembayaran: 'asc',
      },
    });

    // Summary calculations
    const totalRevenue = payments.reduce((acc, p) => acc + p.total_pembayaran, 0);
    const totalTransactions = payments.length;
    const averageTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    // Breakdown by payment method
    const paymentMethods = { Cash: 0, QRIS: 0, Debit: 0 };
    payments.forEach((p) => {
      if (paymentMethods[p.metode_pembayaran] !== undefined) {
        paymentMethods[p.metode_pembayaran] += p.total_pembayaran;
      }
    });

    // Best selling menu items
    const menuSales = {};
    payments.forEach((p) => {
      p.pesanan.detail.forEach((d) => {
        const menuName = d.menu.nama_menu;
        if (!menuSales[menuName]) {
          menuSales[menuName] = { name: menuName, category: d.menu.kategori, quantity: 0, total: 0 };
        }
        menuSales[menuName].quantity += d.jumlah;
        menuSales[menuName].total += d.subtotal;
      });
    });

    const topSellingMenus = Object.values(menuSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Orders status stats
    const totalOrders = await prisma.pesanan.count();
    const completedOrders = await prisma.pesanan.count({ where: { status_pesanan: 'Completed' } });
    const pendingOrders = await prisma.pesanan.count({ where: { status_pesanan: 'Pending' } });
    const cookingOrders = await prisma.pesanan.count({ where: { status_pesanan: 'Cooking' } });
    const readyOrders = await prisma.pesanan.count({ where: { status_pesanan: 'Ready' } });

    // Revenue trends timeline
    const timelineMap = {};
    payments.forEach((p) => {
      const dateStr = p.tanggal_pembayaran.toISOString().split('T')[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = 0;
      }
      timelineMap[dateStr] += p.total_pembayaran;
    });

    const revenueTrend = Object.keys(timelineMap).map((date) => ({
      date,
      revenue: timelineMap[date],
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction,
          totalOrders,
          completedOrders,
          pendingOrders,
          cookingOrders,
          readyOrders,
        },
        paymentMethods: Object.keys(paymentMethods).map((method) => ({
          method,
          total: paymentMethods[method],
        })),
        topSellingMenus,
        revenueTrend,
        transactions: payments.map((p) => ({
          id_pembayaran: p.id_pembayaran,
          tanggal: p.tanggal_pembayaran,
          nama_pelanggan: p.pesanan.nama_pelanggan,
          metode: p.metode_pembayaran,
          total: p.total_pembayaran,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getReports,
};
