const express = require('express');
const router = express.Router();
const { toggleFavorite, getMyFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getMyFavorites)
  .post(protect, toggleFavorite);

module.exports = router;
