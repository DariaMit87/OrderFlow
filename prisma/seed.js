require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// populates the database with users, tables, and menu items
async function main() {
  console.log('Clearing existing data...');


  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();

  // Reset all tables to unoccupied after clearing orders
  await prisma.restaurantTable.updateMany({ data: { isOccupied: false } });

  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create two waiter accounts
  await prisma.user.create({ data: { username: 'waiter1', name: 'James Wilson',   password: hashedPassword, role: 'WAITER' } });
  await prisma.user.create({ data: { username: 'waiter2', name: 'Emma Thompson',  password: hashedPassword, role: 'WAITER' } });

  // Create two cook accounts
  await prisma.user.create({ data: { username: 'cook1',   name: 'Oliver Smith',   password: hashedPassword, role: 'COOK'   } });
  await prisma.user.create({ data: { username: 'cook2',   name: 'Sarah Johnson',  password: hashedPassword, role: 'COOK'   } });

  console.log('Seeding tables...');

  // Create 10 restaurant tables
  for (let i = 1; i <= 10; i++) {
    await prisma.restaurantTable.upsert({
      where:  { tableNumber: i },
      update: {},
      create: { tableNumber: i },
    });
  }

  console.log('Seeding menu...');

  // Create the menu
  const menuItems = [
    { name: 'Garlic Bread',       description: 'Toasted ciabatta with garlic butter and parsley',      price: 5.50,  category: 'Starters'  },
    { name: 'Soup of the Day',    description: 'Freshly made soup served with crusty bread',           price: 6.00,  category: 'Starters'  },
    { name: 'Prawn Cocktail',     description: 'King prawns with Marie Rose sauce and salad leaves',   price: 8.50,  category: 'Starters'  },

    { name: 'Spaghetti Bolognese',   description: 'Spaghetti with slow-cooked beef and tomato sauce', price: 13.50, category: 'Pasta'     },
    { name: 'Penne Arrabbiata',      description: 'Penne in a spicy tomato and chilli sauce',         price: 12.00, category: 'Pasta'     },
    { name: 'Tagliatelle Carbonara', description: 'Tagliatelle with bacon, egg, cream and parmesan',  price: 13.00, category: 'Pasta'     },

    { name: 'Grilled Chicken',    description: 'Free-range chicken breast with roasted vegetables',    price: 16.00, category: 'Mains'     },
    { name: 'Beef Steak',         description: '8oz sirloin steak cooked to your liking',              price: 28.00, category: 'Mains'     },
    { name: 'Pan-fried Salmon',   description: 'Atlantic salmon fillet with lemon butter sauce',       price: 19.00, category: 'Mains'     },
    { name: 'Lamb Chops',         description: 'Grilled lamb chops with mint sauce and potatoes',      price: 24.00, category: 'Mains'     },

    { name: 'Chocolate Cake',     description: 'Warm dark chocolate cake with vanilla ice cream',      price: 7.00,  category: 'Desserts'  },
    { name: 'Vanilla Ice Cream',  description: 'Three scoops of vanilla ice cream with wafers',        price: 5.50,  category: 'Desserts'  },

    { name: 'Still Water',        description: '500ml still mineral water',                            price: 2.50,  category: 'Drinks'    },
    { name: 'Coffee',             description: 'Freshly brewed espresso or Americano',                 price: 3.00,  category: 'Drinks'    },
    { name: 'House Wine',         description: 'Glass of red or white house wine',                     price: 5.50,  category: 'Drinks'    },
  ];

  // Insert every menu item
  await prisma.menuItem.createMany({ data: menuItems });

  console.log('Done! Database seeded successfully.');
  console.log('Test accounts (password: password123)');
  console.log('  Waiters: waiter1 (James Wilson), waiter2 (Emma Thompson)');
  console.log('  Cooks:   cook1   (Oliver Smith),  cook2   (Sarah Johnson)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
