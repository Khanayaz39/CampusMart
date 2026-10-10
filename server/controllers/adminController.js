const User = require('../models/User');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Report = require('../models/Report');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Count completed & paid offers + any other listings marked as sold
    const completedOffers = await Offer.find({ status: 'completed' }).select('product');
    const completedProductIds = completedOffers
      .map(o => (o.product ? o.product.toString() : null))
      .filter(Boolean);
    const additionalSoldProducts = await Product.countDocuments({
      status: 'sold',
      _id: { $nin: completedProductIds }
    });
    const totalOffers = completedOffers.length + additionalSoldProducts;

    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalProducts,
      totalOffers,
      pendingReports
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Product.deleteMany({ seller: req.params.id });
    res.json({ message: 'User and their products deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted by admin' });
  } catch (error) {
    next(error);
  }
};
