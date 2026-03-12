 const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');

// Image upload setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes
const { productCreateRules, productUpdateRules, validateResult } = require('../middleware/validators');
router.post('/', protect, admin, upload.array('images', 5), productCreateRules, validateResult, createProduct);
router.put('/:id', protect, admin, productUpdateRules, validateResult, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
