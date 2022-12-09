const express = require('express');
const { createNewOrder, getMyOrders, getAllOrders, getOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth')
const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser, createNewOrder);
router.route('/orders/me').get(isAuthenticatedUser, getMyOrders);
router.route('/order/:id').get(isAuthenticatedUser, getOrder);

router.route('/admin/orders').get(isAuthenticatedUser, authorizedRoles('admin'), getAllOrders);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizedRoles('admin'), updateOrder);
router.route('/admin/order/:id').delete(isAuthenticatedUser, authorizedRoles('admin'), deleteOrder);

module.exports = router;