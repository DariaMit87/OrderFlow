const express = require('express');
const router = express.Router();
const waiterController = require('../controllers/waiterController');
const { ensureRole } = require('../middleware/authMiddleware');

router.use(ensureRole('WAITER'));

router.get('/', waiterController.getDashboard);
router.get('/table/:tableId/order', waiterController.getCreateOrder);
router.post('/table/:tableId/order', waiterController.postCreateOrder);
router.get('/orders', waiterController.getOrders);
router.post('/orders/item/:itemId/deliver', waiterController.markDelivered);

module.exports = router;
