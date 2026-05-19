const express = require('express');
const router = express.Router();
const waiterController = require('../controllers/waiterController');
const { ensureRole } = require('../middleware/authMiddleware');

//Only users with the WAITER role can access waiter routes
router.use(ensureRole('WAITER'));

// Table overview, waiters main page
router.get('/', waiterController.getDashboard);

router.get('/table/:tableId/order', waiterController.getCreateOrder);

// Submit a new order for a specific table
router.post('/table/:tableId/order', waiterController.postCreateOrder);

// View all orders created by this waiter with live status
router.get('/orders', waiterController.getOrders);

router.post('/orders/item/:itemId/deliver', waiterController.markDelivered);

module.exports = router;
