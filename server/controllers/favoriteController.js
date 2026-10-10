const Favorite = require('../models/Favorite');

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ user: userId, product: productId });
    
    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Removed from favorites', isFavorited: false });
    } else {
      await Favorite.create({ user: userId, product: productId });
      return res.status(201).json({ message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('product');
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};
