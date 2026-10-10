const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res, next) => {
  try {
    const { revieweeId, productId, rating, comment } = req.body;
    
    if (req.user._id.toString() === revieweeId) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      product: productId,
      rating,
      comment
    });

    // Update reviewee's average rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: avgRating,
      totalReviews: allReviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

exports.getReviewsForUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profileImage role isVerified')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
