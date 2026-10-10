const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct, 
  getMyProducts 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { moderateProductListingMiddleware } = require('../middleware/contentModeration');

router.route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 5), moderateProductListingMiddleware, createProduct);

router.get('/my-products', protect, getMyProducts);

router.route('/:id')
  .get(getProduct)
  .put(protect, moderateProductListingMiddleware, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
