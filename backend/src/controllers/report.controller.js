const prisma = require('../config/prisma');

async function getReports(req, res) {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly

    const now = new Date();
    
    // Determine start and end dates for current period and comparison previous period
    let startDate = new Date(now);
    let prevStartDate = new Date(now);

    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      prevStartDate.setDate(startDate.getDate() - 7);
      prevStartDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);

      prevStartDate.setDate(startDate.getDate() - 30);
      prevStartDate.setHours(0, 0, 0, 0);
    } else if (period === 'yearly') {
      startDate.setDate(now.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);

      prevStartDate.setDate(startDate.getDate() - 365);
      prevStartDate.setHours(0, 0, 0, 0);
    } else {
      // Default: daily (today)
      startDate.setHours(0, 0, 0, 0);

      prevStartDate.setDate(startDate.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
    }

    // 1. Current Period Payments & Orders
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

    // 2. Previous Period Payments (for growth calculation)
    const prevPayments = await prisma.pembayaran.findMany({
      where: {
        tanggal_pembayaran: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
      select: {
        id_pembayaran: true,
        total_pembayaran: true,
      },
    });

    const totalRevenue = payments.reduce((acc, p) => acc + p.total_pembayaran, 0);
    const prevTotalRevenue = prevPayments.reduce((acc, p) => acc + p.total_pembayaran, 0);
    const revenueGrowth = prevTotalRevenue > 0
      ? Number((((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(1))
      : (totalRevenue > 0 ? 100 : 0);

    const totalTransactions = payments.length;
    const prevTransactions = prevPayments.length;
    const customersGrowth = prevTransactions > 0
      ? Number((((totalTransactions - prevTransactions) / prevTransactions) * 100).toFixed(1))
      : (totalTransactions > 0 ? 100 : 0);

    const averageTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    // Total orders count in current period
    const totalOrders = await prisma.pesanan.count({
      where: {
        tanggal_pesanan: {
          gte: startDate,
          lte: now,
        },
      },
    });
    const prevTotalOrders = await prisma.pesanan.count({
      where: {
        tanggal_pesanan: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    });
    const ordersGrowth = prevTotalOrders > 0
      ? Number((((totalOrders - prevTotalOrders) / prevTotalOrders) * 100).toFixed(1))
      : (totalOrders > 0 ? 100 : 0);

    // 3. Best selling menu items & Category sales breakdown from DetailPesanan
    const menuSalesMap = {};
    const categorySalesMap = { Makanan: 0, Minuman: 0, Camilan: 0, Dessert: 0 };

    payments.forEach((p) => {
      if (p.pesanan && p.pesanan.detail) {
        p.pesanan.detail.forEach((d) => {
          const menuName = d.menu ? d.menu.nama_menu : 'Uncategorized';
          const category = d.menu ? d.menu.kategori : 'Makanan';

          if (!menuSalesMap[menuName]) {
            menuSalesMap[menuName] = { name: menuName, category, quantity: 0, total: 0 };
          }
          menuSalesMap[menuName].quantity += d.jumlah;
          menuSalesMap[menuName].total += d.subtotal;

          if (categorySalesMap[category] !== undefined) {
            categorySalesMap[category] += d.jumlah;
          } else {
            categorySalesMap[category] = (categorySalesMap[category] || 0) + d.jumlah;
          }
        });
      }
    });

    const topSellingMenus = Object.values(menuSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const categoryColors = {
      Makanan: '#2A2725',
      Minuman: '#C9A96E',
      Camilan: '#EAB308',
      Dessert: '#EC4899',
    };

    const categoryPieData = Object.keys(categorySalesMap)
      .map((cat) => ({
        name: cat,
        value: categorySalesMap[cat],
        color: categoryColors[cat] || '#64748B',
      }))
      .filter((c) => c.value > 0);

    // 4. Revenue Trend Line Chart
    const timelineMap = {};
    payments.forEach((p) => {
      let dateKey;
      if (period === 'daily') {
        dateKey = p.tanggal_pembayaran.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else if (period === 'yearly') {
        dateKey = p.tanggal_pembayaran.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      } else {
        dateKey = p.tanggal_pembayaran.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      }

      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = 0;
      }
      timelineMap[dateKey] += p.total_pembayaran;
    });

    const revenueTrend = Object.keys(timelineMap).map((date) => ({
      date,
      revenue: timelineMap[date],
    }));

    // 5. Monthly Revenue Bar Chart (Current Year - 12 Months: Jan..Des)
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearlyPayments = await prisma.pembayaran.findMany({
      where: {
        tanggal_pembayaran: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        tanggal_pembayaran: true,
        total_pembayaran: true,
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyRevenueMap = {};
    monthNames.forEach((m) => { monthlyRevenueMap[m] = 0; });

    yearlyPayments.forEach((p) => {
      const monthIdx = p.tanggal_pembayaran.getMonth();
      const monthName = monthNames[monthIdx];
      monthlyRevenueMap[monthName] += p.total_pembayaran;
    });

    const monthlyRevenue = monthNames.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month],
    }));

    // 6. Bottom Cards Revenue Summary (Today, This Week, This Month, This Year)
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - 7); startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek); startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      paymentsToday,
      paymentsYesterday,
      paymentsThisWeek,
      paymentsLastWeek,
      paymentsThisMonth,
      paymentsLastMonth,
      paymentsThisYear,
      paymentsLastYear,
    ] = await Promise.all([
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfToday } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfYesterday, lt: startOfToday } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfThisWeek } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfLastWeek, lt: startOfThisWeek } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfThisMonth } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: startOfYear } } }),
      prisma.pembayaran.aggregate({ _sum: { total_pembayaran: true }, where: { tanggal_pembayaran: { gte: new Date(currentYear - 1, 0, 1), lt: startOfYear } } }),
    ]);

    const revToday = paymentsToday._sum.total_pembayaran || 0;
    const revYesterday = paymentsYesterday._sum.total_pembayaran || 0;
    const revTodayGrowth = revYesterday > 0 ? Number((((revToday - revYesterday) / revYesterday) * 100).toFixed(1)) : (revToday > 0 ? 100 : 0);

    const revThisWeek = paymentsThisWeek._sum.total_pembayaran || 0;
    const revLastWeek = paymentsLastWeek._sum.total_pembayaran || 0;
    const revWeekGrowth = revLastWeek > 0 ? Number((((revThisWeek - revLastWeek) / revLastWeek) * 100).toFixed(1)) : (revThisWeek > 0 ? 100 : 0);

    const revThisMonth = paymentsThisMonth._sum.total_pembayaran || 0;
    const revLastMonth = paymentsLastMonth._sum.total_pembayaran || 0;
    const revMonthGrowth = revLastMonth > 0 ? Number((((revThisMonth - revLastMonth) / revLastMonth) * 100).toFixed(1)) : (revThisMonth > 0 ? 100 : 0);

    const revThisYear = paymentsThisYear._sum.total_pembayaran || 0;
    const revLastYear = paymentsLastYear._sum.total_pembayaran || 0;
    const revYearGrowth = revLastYear > 0 ? Number((((revThisYear - revLastYear) / revLastYear) * 100).toFixed(1)) : (revThisYear > 0 ? 100 : 0);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          revenueGrowth,
          totalTransactions,
          customersGrowth,
          averageTransaction,
          totalOrders,
          ordersGrowth,
        },
        topSellingMenus,
        categoryPieData,
        revenueTrend,
        monthlyRevenue,
        revenueSummary: {
          today: revToday,
          todayGrowth: revTodayGrowth,
          thisWeek: revThisWeek,
          thisWeekGrowth: revWeekGrowth,
          thisMonth: revThisMonth,
          thisMonthGrowth: revMonthGrowth,
          thisYear: revThisYear,
          thisYearGrowth: revYearGrowth,
        },
        transactions: payments.map((p) => ({
          id_pembayaran: p.id_pembayaran,
          tanggal: p.tanggal_pembayaran,
          nama_pelanggan: p.pesanan ? p.pesanan.nama_pelanggan : 'Umum',
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

