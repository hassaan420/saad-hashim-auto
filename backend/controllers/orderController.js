const Order = require('../models/Order');
const { 
  sendAdminOrderEmail, 
  sendCustomerOrderEmail,
  sendOrderApprovedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail
} = require('../utils/sendEmail');

// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      itemsPrice,
      shippingPrice,
      totalPrice,
      userEmail
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      itemsPrice,
      shippingPrice,
      totalPrice,
      userEmail: userEmail || req.user.email
    });

    // Send email notifications
    try {
      await sendAdminOrderEmail(order);
      if (order.userEmail) {
        await sendCustomerOrderEmail(order);
      }
    } catch (emailError) {
      console.log('Email error:', emailError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/orders/:id/status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newStatus = req.body.status || order.status;
    order.status = newStatus;

    if (newStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (req.body.isPaid) {
      order.isPaid = true;
    }

    const updatedOrder = await order.save();

    // Send email based on new status
    try {
      if (updatedOrder.userEmail) {
        if (newStatus === 'approved') {
          await sendOrderApprovedEmail(updatedOrder);
        } else if (newStatus === 'dispatched') {
          await sendOrderDispatchedEmail(updatedOrder);
        } else if (newStatus === 'delivered') {
          await sendOrderDeliveredEmail(updatedOrder);
        }
      }
    } catch (emailError) {
      console.log('Status email error:', emailError.message);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};