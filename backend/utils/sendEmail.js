const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email to ADMIN when new order placed
const sendAdminOrderEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `🆕 New Order — #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#d0021b;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">New Order Received!</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <h2 style="color:#d0021b;">Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
          <h3>Customer Details</h3>
          <p><b>Name:</b> ${order.shippingAddress.fullName}</p>
          <p><b>Phone:</b> ${order.shippingAddress.phone}</p>
          <p><b>Email:</b> ${order.userEmail}</p>
          <p><b>Address:</b> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
          <p><b>Payment:</b> ${order.paymentMethod}</p>
          <h3>Items</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#d0021b;color:white;">
              <th style="padding:10px;text-align:left;">Product</th>
              <th style="padding:10px;">Qty</th>
              <th style="padding:10px;">Price</th>
            </tr>
            ${order.items.map(item => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${item.name}</td>
                <td style="padding:10px;text-align:center;">${item.quantity}</td>
                <td style="padding:10px;text-align:right;">Rs. ${(item.price*item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top:20px;padding:15px;background:white;border-left:4px solid #d0021b;">
            <p><b>Total: Rs. ${order.totalPrice.toLocaleString()}</b></p>
          </div>
          <p style="margin-top:20px;color:#666;">Login to admin panel to manage this order.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Email to CUSTOMER when order placed
const sendCustomerOrderEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.userEmail,
    subject: `✅ Order Placed — Saad Hashim Auto Store #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#d0021b;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Order Placed Successfully!</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <p>Dear <b>${order.shippingAddress.fullName}</b>,</p>
          <p>Thank you! We received your order and will confirm it shortly.</p>
          <h2 style="color:#d0021b;">Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#d0021b;color:white;">
              <th style="padding:10px;text-align:left;">Product</th>
              <th style="padding:10px;">Qty</th>
              <th style="padding:10px;">Price</th>
            </tr>
            ${order.items.map(item => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${item.name}</td>
                <td style="padding:10px;text-align:center;">${item.quantity}</td>
                <td style="padding:10px;text-align:right;">Rs. ${(item.price*item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top:20px;padding:15px;background:white;border-left:4px solid #d0021b;">
            <p><b>Payment:</b> ${order.paymentMethod}</p>
            <p><b>Address:</b> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            <p><b>Total: Rs. ${order.totalPrice.toLocaleString()}</b></p>
          </div>
          <div style="margin-top:20px;padding:15px;background:#fff3cd;border-radius:8px;">
            <p>📦 <b>What happens next?</b></p>
            <p>We will review and confirm your order soon. You will receive another email once confirmed.</p>
            <p>Questions? WhatsApp: <b>+92 316 0525191</b></p>
          </div>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Email to CUSTOMER when order is APPROVED
const sendOrderApprovedEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.userEmail,
    subject: `✅ Order Approved — Saad Hashim Auto Store #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#28a745;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Order Approved! 🎉</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <p>Dear <b>${order.shippingAddress.fullName}</b>,</p>
          <p>Great news! Your order has been <b>approved</b> and is being prepared.</p>
          <h2 style="color:#d0021b;">Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
          <div style="padding:15px;background:white;border-left:4px solid #28a745;margin-bottom:20px;">
            <p>✅ Status: <b>Approved</b></p>
            <p>📦 Your order is being prepared for dispatch.</p>
            <p>🚚 Expected delivery: 1-3 business days</p>
          </div>
          <p>Questions? WhatsApp: <b>+92 316 0525191</b></p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Email to CUSTOMER when order is DISPATCHED
const sendOrderDispatchedEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.userEmail,
    subject: `🚚 Order Dispatched — Saad Hashim Auto Store #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#007bff;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Order On The Way! 🚚</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <p>Dear <b>${order.shippingAddress.fullName}</b>,</p>
          <p>Your order has been <b>dispatched</b> and is on its way!</p>
          <h2 style="color:#d0021b;">Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
          <div style="padding:15px;background:white;border-left:4px solid #007bff;margin-bottom:20px;">
            <p>🚚 Status: <b>Dispatched</b></p>
            <p>📍 Delivering to: ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            <p>⏰ Expected delivery: 1-2 business days</p>
          </div>
          <p>Questions? WhatsApp: <b>+92 316 0525191</b></p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Email to CUSTOMER when order is DELIVERED
const sendOrderDeliveredEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.userEmail,
    subject: `📦 Order Delivered — Saad Hashim Auto Store #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#d0021b;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Order Delivered! 📦</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <p>Dear <b>${order.shippingAddress.fullName}</b>,</p>
          <p>Your order has been <b>delivered</b> successfully!</p>
          <h2 style="color:#d0021b;">Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
          <div style="padding:15px;background:white;border-left:4px solid #d0021b;margin-bottom:20px;">
            <p>✅ Status: <b>Delivered</b></p>
            <p>Thank you for shopping with Saad Hashim Auto Store!</p>
          </div>
          <div style="padding:15px;background:#fff3cd;border-radius:8px;">
            <p>⭐ Enjoyed our service? Tell your friends!</p>
            <p>Questions? WhatsApp: <b>+92 316 0525191</b></p>
          </div>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
  sendOrderApprovedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail
};