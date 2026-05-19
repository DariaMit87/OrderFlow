const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { ensureRole } = require('../middleware/authMiddleware');

// Only users with the COOK role can access kitchen routes
router.use(ensureRole('COOK'));

// Main kitchen display showing all active incoming orders
router.get('/', kitchenController.getDashboard);

router.post('/item/:itemId/status', kitchenController.updateItemStatus);

module.exports = router;
