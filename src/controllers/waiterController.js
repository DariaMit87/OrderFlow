const prisma = require('../config/prisma');

// Shows all tables and their status
async function getDashboard(req, res, next) {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          take: 1,
        },
      },
    });
    res.render('waiter/dashboard', { title: 'Waiter Dashboard', tables, user: req.user });
  } catch (err) {
    next(err);
  }
}

// Loads the "create order" form
async function getCreateOrder(req, res, next) {
  try {
    const tableId = parseInt(req.params.tableId);
    const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
    if (!table) return res.status(404).render('error', { title: 'Not Found', message: 'Table not found.' });

    const menuItems = await prisma.menuItem.findMany({
      where: {},
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group menu items by category
    const categoryOrder = ['Drinks', 'Starters', 'Pasta', 'Mains', 'Desserts'];
    const grouped = {};
    for (const cat of categoryOrder) grouped[cat] = [];
    for (const item of menuItems) {
      if (grouped[item.category]) grouped[item.category].push(item);
    }

    res.render('waiter/createOrder', { title: 'Create Order', table, grouped, user: req.user });
  } catch (err) {
    next(err);
  }
}

// Processes the submitted order form, creates the order and its items in the database
async function postCreateOrder(req, res, next) {
  try {
    const tableId = parseInt(req.params.tableId);
    const orderItems = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (!key.startsWith('qty_')) continue;
      const menuItemId = parseInt(key.slice(4));
      const qty = parseInt(value);
      if (qty > 0) {
        orderItems.push({
          menuItemId,
          quantity: qty,
          notes: req.body[`notes_${menuItemId}`] || null,
        });
      }
    }

    if (orderItems.length === 0) {
      req.flash('error', 'Please add at least one item to the order.');
      return res.redirect(`/waiter/table/${tableId}/order`);
    }

    // Create the order, mark the table as occupied
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          tableId,
          waiterId: req.user.id,
          status: 'PENDING',
          orderItems: { create: orderItems },
        },
      });
      await tx.restaurantTable.update({
        where: { id: tableId },
        data: { isOccupied: true },
      });
    });

    req.flash('success', 'Order sent to kitchen!');
    res.redirect('/waiter/orders');
  } catch (err) {
    next(err);
  }
}

// Fetch all orders created by the waiter
async function getOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { waiterId: req.user.id },
      include: {
        table: true,
        orderItems: {
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Push completed orders to the bottom of the list
    const sorted = [
      ...orders.filter(o => o.status !== 'COMPLETED'),
      ...orders.filter(o => o.status === 'COMPLETED'),
    ];

    res.render('waiter/orders', { title: 'My Orders', orders: sorted, user: req.user });
  } catch (err) {
    next(err);
  }
}

// Mark a READY item as DELIVERED
async function markDelivered(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId);
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!item || item.order.waiterId !== req.user.id) {
      return res.status(403).render('error', { title: 'Forbidden', message: 'Not allowed.' });
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { status: 'DELIVERED' },
    });

    // If every item in the order is delivered, close the order and free the table
    const remaining = await prisma.orderItem.count({
      where: { orderId: item.orderId, status: { not: 'DELIVERED' } },
    });
    if (remaining === 0) {
      await prisma.order.update({ where: { id: item.orderId }, data: { status: 'COMPLETED' } });
      await prisma.restaurantTable.update({ where: { id: item.order.tableId }, data: { isOccupied: false } });
    }

    req.flash('success', 'Item marked as delivered.');
    res.redirect('/waiter/orders');
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getCreateOrder, postCreateOrder, getOrders, markDelivered };
