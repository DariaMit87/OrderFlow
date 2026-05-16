require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { username: 'waiter1' },
    update: {},
    create: { username: 'waiter1', name: 'Marco Rossi', password: hashedPassword, role: 'WAITER' },
  });

  await prisma.user.upsert({
    where: { username: 'waiter2' },
    update: {},
    create: { username: 'waiter2', name: 'Sofia Bianchi', password: hashedPassword, role: 'WAITER' },
  });

  await prisma.user.upsert({
    where: { username: 'cook1' },
    update: {},
    create: { username: 'cook1', name: 'Giuseppe Ferrari', password: hashedPassword, role: 'COOK' },
  });

  await prisma.user.upsert({
    where: { username: 'cook2' },
    update: {},
    create: { username: 'cook2', name: 'Anna Conti', password: hashedPassword, role: 'COOK' },
  });

  // Tables
  for (let i = 1; i <= 10; i++) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: i },
      update: {},
      create: { tableNumber: i, seats: i <= 4 ? 2 : i <= 7 ? 4 : 6 },
    });
  }

  // Menu items
  const menuItems = [
    // Antipasti
    { name: 'Bruschetta al Pomodoro', description: 'Toasted bread with tomatoes, garlic, and basil', price: 6.50, category: 'Antipasti' },
    { name: 'Tagliere di Salumi', description: 'Selection of Italian cured meats', price: 12.00, category: 'Antipasti' },
    { name: 'Carpaccio di Manzo', description: 'Thin sliced beef with rocket and parmesan', price: 13.50, category: 'Antipasti' },
    // Primi
    { name: 'Tagliatelle al Ragù', description: 'Fresh tagliatelle with classic Bolognese sauce', price: 14.00, category: 'Primi' },
    { name: 'Spaghetti Carbonara', description: 'Spaghetti with egg, pecorino, guanciale, and black pepper', price: 13.00, category: 'Primi' },
    { name: 'Risotto ai Funghi Porcini', description: 'Creamy risotto with porcini mushrooms', price: 15.00, category: 'Primi' },
    { name: 'Penne all\'Arrabbiata', description: 'Penne with spicy tomato sauce', price: 12.00, category: 'Primi' },
    // Secondi
    { name: 'Saltimbocca alla Romana', description: 'Veal with prosciutto and sage in white wine', price: 22.00, category: 'Secondi' },
    { name: 'Branzino al Forno', description: 'Oven-baked sea bass with lemon and capers', price: 24.00, category: 'Secondi' },
    { name: 'Bistecca alla Fiorentina', description: 'Florentine T-bone steak, 400g', price: 35.00, category: 'Secondi' },
    // Contorni
    { name: 'Insalata Mista', description: 'Mixed seasonal salad', price: 5.00, category: 'Contorni' },
    { name: 'Patate al Rosmarino', description: 'Roasted potatoes with rosemary', price: 5.50, category: 'Contorni' },
    { name: 'Verdure Grigliate', description: 'Grilled seasonal vegetables', price: 6.00, category: 'Contorni' },
    // Dolci
    { name: 'Tiramisù', description: 'Classic Italian dessert with mascarpone and espresso', price: 7.00, category: 'Dolci' },
    { name: 'Panna Cotta', description: 'Vanilla panna cotta with berry coulis', price: 6.50, category: 'Dolci' },
    // Bevande
    { name: 'Acqua Naturale 0.5L', description: 'Still water', price: 2.50, category: 'Bevande' },
    { name: 'Acqua Frizzante 0.5L', description: 'Sparkling water', price: 2.50, category: 'Bevande' },
    { name: 'Vino della Casa (calice)', description: 'House wine by the glass', price: 5.00, category: 'Bevande' },
    { name: 'Caffè Espresso', description: 'Italian espresso', price: 2.00, category: 'Bevande' },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  console.log('Seeding complete!');
  console.log('');
  console.log('Test accounts (password: password123):');
  console.log('  Waiter: waiter1, waiter2');
  console.log('  Cook:   cook1, cook2');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
