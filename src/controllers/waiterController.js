const prisma = require('../config/prisma');

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

async function getCreateOrder(req, res, next) {
  try {
    const tableId = parseInt(req.params.tableId);
    const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
    if (!table) return res.status(404).render('error', { title: 'Not Found', message: 'Table not found.' });

    const menuItems = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const grouped = {};
    for (const item of menuItems) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    res.render('waiter/createOrder', { title: 'Create Order', table, grouped, user: req.user });
  } catch (err) {
    next(err);
  }
}

async function postCreateOrder(req, res, next) {
  try {
    const tableId = parseInt(req.params.tableId);
    const { items } = req.body;

    const orderItems = [];
    if (items) {
      for (const [menuItemId, data] of Object.entries(items)) {
        if (!data || typeof data !== 'object') continue;
        const qty = parseInt(data.quantity);
        if (qty > 0) {
          orderItems.push({
            menuItemId: parseInt(menuItemId),
            quantity: qty,
            notes: data.notes || null,
          });
        }
      }
    }

    if (orderItems.length === 0) {
      req.flash('error', 'Please add at least one item to the order.');
      return res.redirect(`/waiter/table/${tableId}/order`);
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
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
      return order;
    });

    req.flash('success', 'Order sent to kitchen!');
    res.redirect('/waiter/orders');
  } catch (err) {
    next(err);
  }
}

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
    res.render('waiter/orders', { title: 'My Orders', orders, user: req.user });
  } catch (err) {
    next(err);
  }
}

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

    if (item.status !== 'READY') {
      req.flash('error', 'Only READY items can be marked as delivered.');
      return res.redirect('/waiter/orders');
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { status: 'DELIVERED' },
    });

    // If all items in the order are delivered, mark order completed
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
