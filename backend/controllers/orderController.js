const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
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
    const { items, shippingAddress, paymentMethod, paymentDetails, userEmail } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

    // Start DB transaction to protect stock and order creation
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let itemsPrice = 0;
      const orderItems = [];

      // For each item, lookup product from DB and verify stock and price
      for (const it of items) {
        const pid = it.product;
        const qty = Number(it.quantity) || 0;
        if (!mongoose.Types.ObjectId.isValid(pid) || qty < 1) {
          throw new Error('Invalid item in cart');
        }

        const prod = await Product.findById(pid).session(session);
        if (!prod) throw new Error('Product not found: ' + pid);

        // Check stock atomically by reducing stock via conditional update
        const updated = await Product.findOneAndUpdate(
          { _id: pid, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { session, new: true }
        );
        if (!updated) {
          throw new Error(`Insufficient stock for product: ${prod.name}`);
        }

        const linePrice = prod.price * qty;
        itemsPrice += linePrice;
        orderItems.push({ product: prod._id, name: prod.name, price: prod.price, quantity: qty });
      }

      // Calculate shipping and tax on server-side
      const shippingPrice = itemsPrice > 5000 ? 0 : 250;
      const taxRate = Number(process.env.TAX_RATE) || 0;
      const tax = +(itemsPrice * taxRate).toFixed(2);
      const totalPrice = +(itemsPrice + shippingPrice + tax).toFixed(2);

      const orderDoc = {
        user: req.user ? req.user._id : null, // null for guest orders
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        itemsPrice,
        shippingPrice,
        totalPrice,
        userEmail: userEmail || (req.user ? req.user.email : null)
      };

      // Create order within transaction
      const created = await Order.create([orderDoc], { session });

      await session.commitTransaction();
      session.endSession();

      const order = created[0];

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
      return;
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: txError.message });
    }
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

    // Allow admin OR the owning user OR guest (no user on order) to view
    const isOwner = req.user && order.user && order.user._id && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.isAdmin;
    const isGuest = !order.user; // guest order with no user attached
    if (!isOwner && !isAdmin && !isGuest) {
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