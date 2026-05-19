const prisma = require('../config/prisma');

// Fetches all active orders (PENDING or IN_PROGRESS) and passes them to the kitchen view
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
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Only show orders that still have undelivered items
    const activeOrders = orders.filter(o => o.orderItems.length > 0);

    res.render('kitchen/dashboard', { title: 'Kitchen Dashboard', orders: activeOrders, user: req.user });
  } catch (err) {
    next(err);
  }
}

// Updates the status of an order item (NEW → COOKING → READY) and recalculates the parent order status
async function updateItemStatus(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId);
    const { status } = req.body;

    // Only allow moving status to COOKING or READY - not backwards
    const allowed = ['COOKING', 'READY'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: { order: true },
    });

    // Change the parent order's status based on all its items
    const allItems = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
    const statuses = allItems.map(i => i.status);

    let orderStatus = 'PENDING';
    if (statuses.every(s => s === 'DELIVERED')) {
      orderStatus = 'COMPLETED';
    } else if (statuses.some(s => s === 'COOKING' || s === 'READY')) {
      orderStatus = 'IN_PROGRESS';
    }

    await prisma.order.update({ where: { id: item.orderId }, data: { status: orderStatus } });

    res.redirect('/kitchen');
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, updateItemStatus };
