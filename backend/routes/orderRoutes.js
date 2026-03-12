const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

// User routes
const { orderCreateRules, orderStatusRules, validateResult } = require('../middleware/validators');
router.post('/', optionalAuth, orderCreateRules, validateResult, createOrder); // guests allowed
router.get('/myorders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, orderStatusRules, validateResult, updateOrderStatus);

module.exports = router;
