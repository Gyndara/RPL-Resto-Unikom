const prisma = require('../config/prisma');

async function getMenus(req, res) {
  try {
    const { category, search, status } = req.query;

    const whereClause = {};

    if (category && category !== 'All' && category !== 'Semua') {
      whereClause.kategori = category;
    }

    if (status) {
      whereClause.status_menu = status;
    }

    if (search) {
      whereClause.OR = [
        { nama_menu: { contains: search } },
        { deskripsi: { contains: search } },
      ];
    }

    const menus = await prisma.menu.findMany({
      where: whereClause,
      orderBy: { id_menu: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMenuById(req, res) {
  try {
    const { id } = req.params;
    const menu = await prisma.menu.findUnique({
      where: { id_menu: parseInt(id) },
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createMenu(req, res) {
  try {
    const { nama_menu, deskripsi, kategori, harga, jumlah_porsi, gambar } = req.body;

    if (!nama_menu || !kategori || !harga) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required',
      });
    }

    let imageUrl = gambar || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const porsi = parseInt(jumlah_porsi) || 0;
    const status_menu = porsi > 0 ? 'Available' : 'Unavailable';

    const newMenu = await prisma.menu.create({
      data: {
        nama_menu,
        deskripsi: deskripsi || '',
        kategori,
        harga: parseFloat(harga),
        jumlah_porsi: porsi,
        gambar: imageUrl,
        status_menu,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: newMenu,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateMenu(req, res) {
  try {
    const { id } = req.params;
    const { nama_menu, deskripsi, kategori, harga, jumlah_porsi, gambar } = req.body;

    const existingMenu = await prisma.menu.findUnique({
      where: { id_menu: parseInt(id) },
    });

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    let imageUrl = existingMenu.gambar;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (gambar !== undefined) {
      imageUrl = gambar;
    }

    const porsi = jumlah_porsi !== undefined ? parseInt(jumlah_porsi) : existingMenu.jumlah_porsi;
    const status_menu = porsi > 0 ? 'Available' : 'Unavailable';

    const updatedMenu = await prisma.menu.update({
      where: { id_menu: parseInt(id) },
      data: {
        nama_menu: nama_menu || existingMenu.nama_menu,
        deskripsi: deskripsi !== undefined ? deskripsi : existingMenu.deskripsi,
        kategori: kategori || existingMenu.kategori,
        harga: harga !== undefined ? parseFloat(harga) : existingMenu.harga,
        jumlah_porsi: porsi,
        gambar: imageUrl,
        status_menu,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      data: updatedMenu,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteMenu(req, res) {
  try {
    const { id } = req.params;

    await prisma.menu.delete({
      where: { id_menu: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
};
