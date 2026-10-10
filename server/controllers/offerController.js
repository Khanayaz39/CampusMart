const Offer = require('../models/Offer');
const Product = require('../models/Product');
const User = require('../models/User');
const {
  sendNewOfferEmail,
  sendOfferStatusEmail,
  sendCounterAcceptedEmailToSeller
} = require('../services/emailService');

exports.createOffer = async (req, res, next) => {
  try {
    const { productId, amount, message } = req.body;
    
    if (!productId || !amount) {
      return res.status(400).json({ message: 'Product ID and offer amount are required' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive offer amount' });
    }

    const product = await Product.findById(productId).populate('seller', 'name email upiId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot make an offer on your own product' });
    }

    const offer = await Offer.create({
      product: productId,
      buyer: req.user._id,
      seller: product.seller._id,
      amount: numericAmount,
      message: message ? message.trim() : ''
    });

    // Notify seller via email
    if (product.seller && product.seller.email) {
      sendNewOfferEmail(
        product.seller.email,
        product.seller.name || 'Campus Seller',
        req.user.name || 'A Student',
        product.title,
        numericAmount,
        message
      ).catch(err => console.warn('Offer email notice failed:', err));
    }

    res.status(201).json(offer);
  } catch (error) {
    next(error);
  }
};

exports.getOffersForProduct = async (req, res, next) => {
  try {
    const offers = await Offer.find({ product: req.params.productId })
      .populate('buyer', 'name profileImage rating')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

// Offers sent by current user (as buyer)
exports.getMyOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ buyer: req.user._id })
      .populate('product', 'title price images category condition')
      .populate('seller', 'name email phone upiId upiQrImage profileImage')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

// Offers received by current user (as seller)
exports.getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ seller: req.user._id })
      .populate('product', 'title price images category condition')
      .populate('buyer', 'name email phone profileImage hostel roomNumber')
      .populate('seller', 'name email phone upiId upiQrImage profileImage')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

exports.respondToOffer = async (req, res, next) => {
  try {
    const { status, counterAmount, counterMessage } = req.body;
    const offer = await Offer.findById(req.params.id)
      .populate('product', 'title')
      .populate('buyer', 'name email')
      .populate('seller', 'name email upiId');
    
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    
    const isSeller = offer.seller._id.toString() === req.user._id.toString();
    const isBuyer = offer.buyer._id.toString() === req.user._id.toString();

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'Not authorized to respond to this offer' });
    }

    const buyerAcceptingCounter = isBuyer && offer.status === 'countered' && status === 'accepted';
    const markingPaymentCompleted = (isBuyer || isSeller) && status === 'completed';

    // If buyer is accepting a counter offer, update offer.amount to the agreed counterAmount
    if (buyerAcceptingCounter) {
      if (offer.counterAmount) {
        offer.amount = offer.counterAmount;
      }
    } else if (markingPaymentCompleted) {
      offer.paidAt = new Date();
    } else if (!isSeller) {
      return res.status(403).json({ message: 'Only the seller can accept, counter, or reject this offer' });
    }

    offer.status = status;
    if (status === 'countered') {
      offer.counterAmount = Number(counterAmount) || offer.amount;
      offer.counterMessage = counterMessage || '';
    }

    await offer.save();

    // When a deal is completed and payment is made, mark the product as sold
    if (markingPaymentCompleted && offer.product && offer.product._id) {
      await Product.findByIdAndUpdate(offer.product._id, { status: 'sold' }).catch(() => {});
    }

    const productTitle = offer.product ? offer.product.title : 'Listing';

    // 1. If seller responded (accepted / countered / rejected), notify the buyer
    if (isSeller && !markingPaymentCompleted && offer.buyer && offer.buyer.email) {
      sendOfferStatusEmail(
        offer.buyer.email,
        offer.buyer.name || 'Student Buyer',
        offer.seller.name || 'Campus Seller',
        productTitle,
        offer.amount,
        status,
        offer.counterAmount,
        offer.counterMessage
      ).catch(err => console.warn('Offer status email notice failed:', err));
    }

    // 2. If buyer accepted the seller's counter-offer, notify both seller and buyer
    if (buyerAcceptingCounter) {
      if (offer.seller && offer.seller.email) {
        sendCounterAcceptedEmailToSeller(
          offer.seller.email,
          offer.seller.name || 'Campus Seller',
          offer.buyer ? offer.buyer.name : 'Student Buyer',
          productTitle,
          offer.amount
        ).catch(err => console.warn('Counter accepted email to seller failed:', err));
      }
      if (offer.buyer && offer.buyer.email) {
        sendOfferStatusEmail(
          offer.buyer.email,
          offer.buyer.name || 'Student Buyer',
          offer.seller ? offer.seller.name : 'Campus Seller',
          productTitle,
          offer.amount,
          'accepted'
        ).catch(err => console.warn('Counter accepted confirmation to buyer failed:', err));
      }
    }

    res.json(offer);
  } catch (error) {
    next(error);
  }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const userId = req.user._id.toString();
    const isBuyer = offer.buyer.toString() === userId;
    const isSeller = offer.seller.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this offer' });
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

