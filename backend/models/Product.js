const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Engine Parts',
      'Brakes & Suspension',
      'Electrical & Lights',
      'Body Parts & Panels',
      'Tyres & Wheels',
      'Oils & Lubricants',
      'Accessories'
    ]
  },
  brand: {
    type: String,
    required: true
  },
  compatibleWith: [{
    type: String
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    type: String
  }],
  ratings: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);