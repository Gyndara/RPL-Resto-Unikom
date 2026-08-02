const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  console.log('Seeding database...');
  try {
    // 1. Seed Pegawai
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const pegawais = [
      { nama_pegawai: 'Manager Resto', username: 'manager', password: hashedPassword, role: 'manager' },
      { nama_pegawai: 'Kasir Resto', username: 'kasir', password: hashedPassword, role: 'kasir' },
      { nama_pegawai: 'Pelayan Resto', username: 'pelayan', password: hashedPassword, role: 'pelayan' },
      { nama_pegawai: 'Chef Resto', username: 'chef', password: hashedPassword, role: 'chef' },
    ];

    for (const p of pegawais) {
      await prisma.pegawai.upsert({
        where: { username: p.username },
        update: {},
        create: p,
      });
    }
    console.log('Pegawai seeded.');

    // 2. Seed Meja
    const mejas = [
      { nama_meja: 'Meja 01', kapasitas: 2, status_meja: 'Available' },
      { nama_meja: 'Meja 02', kapasitas: 4, status_meja: 'Available' },
      { nama_meja: 'Meja 03', kapasitas: 4, status_meja: 'Available' },
      { nama_meja: 'Meja 04', kapasitas: 6, status_meja: 'Available' },
      { nama_meja: 'Meja 05', kapasitas: 2, status_meja: 'Available' },
      { nama_meja: 'Meja 06', kapasitas: 4, status_meja: 'Available' },
    ];

    for (const m of mejas) {
      const existing = await prisma.meja.findFirst({ where: { nama_meja: m.nama_meja } });
      if (!existing) {
        await prisma.meja.create({ data: m });
      }
    }
    console.log('Meja seeded.');

    // 3. Seed Menu
    const menus = [
      {
        nama_menu: 'Nasi Goreng Special',
        deskripsi: 'Nasi goreng komplit dengan telur, ayam suwir, dan bakso sapi khas Unikom.',
        kategori: 'Makanan',
        harga: 35000,
        jumlah_porsi: 25,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
      },
      {
        nama_menu: 'Mie Goreng Seafood',
        deskripsi: 'Mie goreng lezat dengan udang segar, cumi, dan telur dadar iris.',
        kategori: 'Makanan',
        harga: 40000,
        jumlah_porsi: 20,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
      },
      {
        nama_menu: 'Ayam Bakar Madu',
        deskripsi: 'Ayam bakar dengan bumbu spesial manis gurih dipadu sambal terasi.',
        kategori: 'Makanan',
        harga: 45000,
        jumlah_porsi: 15,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80',
      },
      {
        nama_menu: 'Sate Ayam Unikom',
        deskripsi: '10 tusuk sate ayam lembut dengan kuah bumbu kacang kental khas.',
        kategori: 'Makanan',
        harga: 38000,
        jumlah_porsi: 30,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
      },
      {
        nama_menu: 'Es Teh Manis',
        deskripsi: 'Es teh manis dingin segar pereda dahaga.',
        kategori: 'Minuman',
        harga: 8000,
        jumlah_porsi: 100,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      },
      {
        nama_menu: 'Es Jeruk Peras',
        deskripsi: 'Sari jeruk asli segar kaya vitamin C dengan es kristal.',
        kategori: 'Minuman',
        harga: 12000,
        jumlah_porsi: 50,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80',
      },
      {
        nama_menu: 'Kopi Susu Gula Aren',
        deskripsi: 'Espresso robusta pilihan dikombinasikan susu cair dan gula aren murni.',
        kategori: 'Minuman',
        harga: 18000,
        jumlah_porsi: 40,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80',
      },
      {
        nama_menu: 'Kentang Goreng Crisp',
        deskripsi: 'Kentang potong impor renyah bertabur garam gurih & saus keju.',
        kategori: 'Camilan',
        harga: 20000,
        jumlah_porsi: 30,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
      },
      {
        nama_menu: 'Roti Bakar Cokelat Keju',
        deskripsi: 'Roti tawar tebal dipanggang dengan mentega, meises cokelat, dan keju melimpah.',
        kategori: 'Dessert',
        harga: 22000,
        jumlah_porsi: 25,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=500&q=80',
      },
      {
        nama_menu: 'Ice Cream Vanilla Brownies',
        deskripsi: 'Brownies cokelat legit disajikan hangat bersama es krim rasa vanilla.',
        kategori: 'Dessert',
        harga: 25000,
        jumlah_porsi: 20,
        status_menu: 'Available',
        gambar: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
      },
    ];

    for (const item of menus) {
      const existing = await prisma.menu.findFirst({ where: { nama_menu: item.nama_menu } });
      if (!existing) {
        await prisma.menu.create({ data: item });
      }
    }
    console.log('Menu seeded.');

    console.log('Database seeding complete successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
