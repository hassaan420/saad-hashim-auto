const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getAllUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validateResult } = require('../middleware/validators');

router.post('/register', registerRules, validateResult, register);
router.post('/login', loginRules, validateResult, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, admin, getAllUsers);

module.exports = router;