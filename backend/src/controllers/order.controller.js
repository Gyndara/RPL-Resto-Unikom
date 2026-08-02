const prisma = require('../config/prisma');

async function createOrder(req, res) {
  try {
    const { id_meja, nama_pelanggan, items } = req.body;

    if (!id_meja || !nama_pelanggan || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Table ID, customer name, and at least one order item are required',
      });
    }

    const table = await prisma.meja.findUnique({
      where: { id_meja: parseInt(id_meja) },
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Verify portion availability and compute subtotals
    const detailData = [];
    for (const item of items) {
      const menu = await prisma.menu.findUnique({
        where: { id_menu: parseInt(item.id_menu) },
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: `Menu item ID ${item.id_menu} not found`,
        });
      }

      if (menu.jumlah_porsi < item.jumlah) {
        return res.status(400).json({
          success: false,
          message: `Insufficient portions for ${menu.nama_menu}. Available: ${menu.jumlah_porsi}`,
        });
      }

      const subtotal = menu.harga * item.jumlah;
      detailData.push({
        id_menu: menu.id_menu,
        jumlah: item.jumlah,
        catatan: item.catatan || '',
        harga: menu.harga,
        subtotal: subtotal,
      });

      // Update menu portion count
      const newPorsi = menu.jumlah_porsi - item.jumlah;
      await prisma.menu.update({
        where: { id_menu: menu.id_menu },
        data: {
          jumlah_porsi: newPorsi,
          status_menu: newPorsi > 0 ? 'Available' : 'Unavailable',
        },
      });
    }

    // Check if there is an active existing order for this table
    const existingActiveOrder = await prisma.pesanan.findFirst({
      where: {
        id_meja: parseInt(id_meja),
        status_pesanan: {
          notIn: ['Completed', 'Cancelled'],
        },
      },
    });

    let order;

    if (existingActiveOrder) {
      // Append items as additional order
      for (const item of detailData) {
        await prisma.detailPesanan.create({
          data: {
            id_pesanan: existingActiveOrder.id_pesanan,
            id_menu: item.id_menu,
            jumlah: item.jumlah,
            catatan: item.catatan,
            harga: item.harga,
            subtotal: item.subtotal,
          },
        });
      }

      order = await prisma.pesanan.findUnique({
        where: { id_pesanan: existingActiveOrder.id_pesanan },
        include: {
          detail: {
            include: { menu: true },
          },
          meja: true,
        },
      });
    } else {
      // Create brand new order
      order = await prisma.pesanan.create({
        data: {
          id_meja: parseInt(id_meja),
          nama_pelanggan,
          status_pesanan: 'Pending',
          detail: {
            create: detailData,
          },
        },
        include: {
          detail: {
            include: { menu: true },
          },
          meja: true,
        },
      });

      // Update table status to Ordering
      await prisma.meja.update({
        where: { id_meja: parseInt(id_meja) },
        data: { status_meja: 'Ordering' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrders(req, res) {
  try {
    const { status, tableId, date } = req.query;

    const whereClause = {};

    if (status) {
      if (status.includes(',')) {
        whereClause.status_pesanan = { in: status.split(',') };
      } else {
        whereClause.status_pesanan = status;
      }
    }

    if (tableId) {
      whereClause.id_meja = parseInt(tableId);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      whereClause.tanggal_pesanan = {
        gte: startDate,
        lte: endDate,
      };
    }

    const orders = await prisma.pesanan.findMany({
      where: whereClause,
      include: {
        meja: true,
        detail: {
          include: {
            menu: true,
          },
        },
        pembayaran: true,
      },
      orderBy: {
        tanggal_pesanan: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await prisma.pesanan.findUnique({
      where: { id_pesanan: parseInt(id) },
      include: {
        meja: true,
        detail: {
          include: {
            menu: true,
          },
        },
        pembayaran: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status_pesanan } = req.body;

    const validStatuses = ['Pending', 'Cooking', 'Ready', 'Delivered', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status_pesanan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const updatedOrder = await prisma.pesanan.update({
      where: { id_pesanan: parseInt(id) },
      data: { status_pesanan },
      include: {
        meja: true,
        detail: {
          include: { menu: true },
        },
      },
    });

    // Automatically update table status based on order progress
    if (status_pesanan === 'Cooking' || status_pesanan === 'Ready' || status_pesanan === 'Delivered') {
      await prisma.meja.update({
        where: { id_meja: updatedOrder.id_meja },
        data: { status_meja: 'Dining' },
      });
    } else if (status_pesanan === 'Completed' || status_pesanan === 'Cancelled') {
      // Check if table has any other active orders
      const otherActiveOrders = await prisma.pesanan.findFirst({
        where: {
          id_meja: updatedOrder.id_meja,
          id_pesanan: { not: updatedOrder.id_pesanan },
          status_pesanan: { notIn: ['Completed', 'Cancelled'] },
        },
      });

      if (!otherActiveOrders) {
        await prisma.meja.update({
          where: { id_meja: updatedOrder.id_meja },
          data: { status_meja: 'Available' },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
