const { checkSchema, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const productCategories = [
  'Engine Parts',
  'Brakes & Suspension',
  'Electrical & Lights',
  'Body Parts & Panels',
  'Tyres & Wheels',
  'Oils & Lubricants',
  'Accessories'
];

const paymentMethods = ['Cash on Delivery', 'EasyPaisa', 'JazzCash', 'Bank Transfer'];

const orderStatus = ['pending', 'approved', 'processing', 'dispatched', 'delivered', 'cancelled'];

const bannerPositions = ['hero', 'promo_strip', 'below_categories'];

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

const registerRules = checkSchema({
  name: {
    in: ['body'],
    trim: true,
    isLength: { options: { min: 2, max: 80 }, errorMessage: 'Name must be 2-80 chars' }
  },
  email: {
    in: ['body'],
    isEmail: { errorMessage: 'Invalid email' },
    normalizeEmail: true
  },
  password: {
    in: ['body'],
    isLength: { options: { min: 8 }, errorMessage: 'Password must be at least 8 chars' }
  },
  phone: {
    in: ['body'],
    optional: true,
    trim: true,
    isLength: { options: { min: 7, max: 20 }, errorMessage: 'Invalid phone' }
  }
});

const loginRules = checkSchema({
  email: { in: ['body'], isEmail: { errorMessage: 'Invalid email' }, normalizeEmail: true },
  password: { in: ['body'], exists: { errorMessage: 'Password required' } }
});

const productCreateRules = checkSchema({
  name: { in: ['body'], trim: true, isLength: { options: { min: 2, max: 200 } } },
  description: { in: ['body'], trim: true, isLength: { options: { min: 5, max: 2000 } } },
  price: { in: ['body'], isFloat: { options: { gt: 0 }, errorMessage: 'Price must be a number > 0' } },
  category: { in: ['body'], isIn: { options: [productCategories], errorMessage: 'Invalid category' } },
  brand: { in: ['body'], trim: true, isLength: { options: { min: 1 } } },
  stock: { in: ['body'], optional: true, isInt: { options: { min: 0 }, errorMessage: 'Stock must be >= 0' } }
});

const productUpdateRules = checkSchema({
  name: { in: ['body'], optional: true, trim: true, isLength: { options: { min: 2, max: 200 } } },
  description: { in: ['body'], optional: true, trim: true, isLength: { options: { min: 5, max: 2000 } } },
  price: { in: ['body'], optional: true, isFloat: { options: { gt: 0 }, errorMessage: 'Price must be a number > 0' } },
  category: { in: ['body'], optional: true, isIn: { options: [productCategories], errorMessage: 'Invalid category' } },
  brand: { in: ['body'], optional: true, trim: true, isLength: { options: { min: 1 } } },
  stock: { in: ['body'], optional: true, isInt: { options: { min: 0 }, errorMessage: 'Stock must be >= 0' } }
});

const orderCreateRules = checkSchema({
  items: {
    in: ['body'],
    custom: {
      options: (value) => Array.isArray(value) && value.length > 0
    },
    errorMessage: 'Items array required'
  },
  'items.*.product': { in: ['body'], custom: { options: (v) => mongoose.Types.ObjectId.isValid(v) }, errorMessage: 'Invalid product id' },
  'items.*.quantity': { in: ['body'], isInt: { options: { min: 1 }, errorMessage: 'Quantity must be >=1' } },
  'shippingAddress.fullName': { in: ['body'], trim: true, isLength: { options: { min: 2 } } },
  'shippingAddress.phone': { in: ['body'], trim: true, isLength: { options: { min: 7, max: 20 } } },
  'shippingAddress.address': { in: ['body'], trim: true, isLength: { options: { min: 5 } } },
  'shippingAddress.city': { in: ['body'], trim: true, isLength: { options: { min: 2 } } },
  paymentMethod: { in: ['body'], isIn: { options: [paymentMethods], errorMessage: 'Invalid payment method' } }
});

const orderStatusRules = checkSchema({
  status: { in: ['body'], isIn: { options: [orderStatus], errorMessage: 'Invalid status' } }
});

const bannerCreateRules = checkSchema({
  title: { in: ['body'], trim: true, isLength: { options: { min: 3, max: 200 } } },
  subtitle: { in: ['body'], optional: true, trim: true, isLength: { options: { max: 500 } } },
  buttonText: { in: ['body'], optional: true, trim: true },
  buttonLink: { in: ['body'], optional: true, trim: true },
  position: { in: ['body'], optional: true, isIn: { options: [bannerPositions] } },
  isActive: { in: ['body'], optional: true, isBoolean: true },
  order: { in: ['body'], optional: true, isInt: { options: { min: 0 } } }
});

const bannerUpdateRules = checkSchema({
  title: { in: ['body'], optional: true, trim: true, isLength: { options: { min: 3, max: 200 } } },
  subtitle: { in: ['body'], optional: true, trim: true, isLength: { options: { max: 500 } } },
  buttonText: { in: ['body'], optional: true, trim: true },
  buttonLink: { in: ['body'], optional: true, trim: true },
  position: { in: ['body'], optional: true, isIn: { options: [bannerPositions] } },
  isActive: { in: ['body'], optional: true, isBoolean: true },
  order: { in: ['body'], optional: true, isInt: { options: { min: 0 } } }
});

module.exports = {
  registerRules,
  loginRules,
  productCreateRules,
  productUpdateRules,
  orderCreateRules,
  orderStatusRules,
  bannerCreateRules,
  bannerUpdateRules,
  validateResult
};
