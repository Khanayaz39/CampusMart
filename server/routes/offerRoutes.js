const express = require('express');
const router = express.Router();
const { 
  createOffer, 
  getOffersForProduct, 
  getMyOffers, 
  getReceivedOffers,
  respondToOffer,
  deleteOffer
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOffer);
router.get('/my-offers', protect, getMyOffers);
router.get('/received', protect, getReceivedOffers);
router.get('/product/:productId', protect, getOffersForProduct);
router.put('/:id/respond', protect, respondToOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;
