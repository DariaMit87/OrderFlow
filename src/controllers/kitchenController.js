const prisma = require('../config/prisma');

async function getDashboard(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: {
        table: true,
        waiter: { select: { name: true } },
        orderItems: {
          where: { status: { not: 'DELIVERED' } },
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Only show orders that still have active items
    const activeOrders = orders.filter(o => o.orderItems.length > 0);

    res.render('kitchen/dashboard', { title: 'Kitchen Dashboard', orders: activeOrders, user: req.user });
  } catch (err) {
    next(err);
  }
}

async function updateItemStatus(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId);
    const { status } = req.body;

    const allowed = ['COOKING', 'READY'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status,
        cookId: req.user.id,
      },
      include: { order: true },
    });

    // Update parent order status based on items
    const items = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
    const statuses = items.map(i => i.status);

    let orderStatus = 'PENDING';
    if (statuses.every(s => s === 'DELIVERED')) {
      orderStatus = 'COMPLETED';
    } else if (statuses.some(s => s === 'COOKING' || s === 'READY')) {
      orderStatus = 'IN_PROGRESS';
    }

    await prisma.order.update({ where: { id: item.orderId }, data: { status: orderStatus } });

    // Respond with JSON for AJAX or redirect for standard form
    if (req.accepts('json') && req.xhr) {
      return res.json({ success: true, status });
    }
    res.redirect('/kitchen');
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, updateItemStatus };
