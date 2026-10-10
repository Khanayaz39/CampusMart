const express = require('express');
const router = express.Router();
const { register, login, verifyOtp, resendOtp, getMe, updateProfile, getVerifiedUsers, getUserById, deleteMyAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/verified-users', getVerifiedUsers);
router.get('/users/:id', getUserById);
router.get('/user/:id', getUserById);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/delete-account', protect, deleteMyAccount);

module.exports = router;
