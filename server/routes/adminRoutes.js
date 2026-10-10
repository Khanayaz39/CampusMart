const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  deleteUser, 
  getAllProducts, 
  deleteProduct 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected and restricted to admins
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

module.exports = router;
