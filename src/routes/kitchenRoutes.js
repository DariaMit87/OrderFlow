const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { ensureRole } = require('../middleware/authMiddleware');

router.use(ensureRole('COOK'));

router.get('/', kitchenController.getDashboard);
router.post('/item/:itemId/status', kitchenController.updateItemStatus);

module.exports = router;
