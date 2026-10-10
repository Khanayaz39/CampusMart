const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate 6-digit numeric OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Shared user payload formatter
const formatUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  hostel: user.hostel,
  department: user.department,
  year: user.year,
  roomNumber: user.roomNumber,
  role: user.role,
  bio: user.bio,
  phone: user.phone,
  upiId: user.upiId || '',
  upiQrImage: user.upiQrImage || '',
  isVerified: user.isVerified,
  verificationStatus: user.verificationStatus,
  profileImage: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`
});

// Shared helper to generate, persist, and email a 6-digit OTP
const issueAndSendOtp = async (user) => {
  const otpCode = generateOtpCode();
  user.otp = otpCode;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  const emailResult = await sendOtpEmail(user.email, otpCode, user.name);
  const delivered = Boolean(emailResult.success && !emailResult.simulated);
  const showDevOtp = process.env.NODE_ENV !== 'production' && !delivered;
  return { otpCode, delivered, devOtp: showDevOtp ? otpCode : undefined };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, college, phone, department, year, hostel, room, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      if (userExists.isDeleted) {
        return res.status(400).json({ message: 'An account with this email was previously deleted. Please contact support or use another email.' });
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let userRole = 'both';
    if (role && ['buyer', 'seller', 'both'].includes(role.toLowerCase())) {
      userRole = role.toLowerCase();
    }

    let parsedYear = undefined;
    if (year !== undefined && year !== null && year !== '') {
      const num = parseInt(year, 10);
      if (!isNaN(num)) {
        parsedYear = num;
      } else {
        const lower = String(year).toLowerCase().trim();
        if (lower.includes('freshman') || lower.includes('1st')) parsedYear = 1;
        else if (lower.includes('sophomore') || lower.includes('2nd')) parsedYear = 2;
        else if (lower.includes('junior') || lower.includes('3rd')) parsedYear = 3;
        else if (lower.includes('senior') || lower.includes('4th')) parsedYear = 4;
        else if (lower.includes('grad') || lower.includes('5th')) parsedYear = 5;
      }
    }

    const user = await User.create({ 
      name: name.trim(), 
      email: cleanEmail, 
      password, 
      role: userRole,
      college: college ? college.trim() : 'VIT Bhopal University',
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      year: parsedYear,
      hostel: hostel ? hostel.trim() : undefined,
      roomNumber: room ? room.trim() : undefined,
      isVerified: false,
      verificationStatus: {
        email: false,
        phone: false,
        college: cleanEmail.endsWith('.ac.in') || cleanEmail.endsWith('.edu') || cleanEmail.includes('vitbhopal')
      }
    });

    const { delivered, devOtp } = await issueAndSendOtp(user);

    res.status(201).json({
      requireOtp: true,
      email: user.email,
      emailDelivered: delivered,
      message: delivered
        ? `Account registered! A 6-digit verification code has been sent to ${user.email}.`
        : 'Account registered! Enter your 6-digit verification code to continue.',
      devOtp
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isDeleted) return res.status(401).json({ message: 'This account has been deleted' });
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No pending verification code found. Please request a new OTP.' });
    }
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new OTP.' });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    user.isVerified = true;
    user.verificationStatus.email = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! Welcome to CampusMart.',
      token: generateToken(user._id),
      user: formatUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { delivered, devOtp } = await issueAndSendOtp(user);

    res.json({
      message: 'A fresh 6-digit verification code has been sent to your email.',
      emailDelivered: delivered,
      devOtp
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email ? email.trim().toLowerCase() : '' });

    if (user && user.isDeleted) {
      return res.status(401).json({ message: 'This account has been deleted' });
    }

    if (user && (await user.matchPassword(password))) {
      const { delivered, devOtp } = await issueAndSendOtp(user);

      return res.status(200).json({
        requireOtp: true,
        email: user.email,
        emailDelivered: delivered,
        message: delivered
          ? `A 6-digit login verification code has been sent to ${user.email}.`
          : 'Enter your 6-digit verification code to complete sign in.',
        devOtp
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.college = req.body.college || user.college;
      user.hostel = req.body.hostel !== undefined ? req.body.hostel : user.hostel;
      user.roomNumber = req.body.roomNumber !== undefined ? req.body.roomNumber : user.roomNumber;
      user.department = req.body.department !== undefined ? req.body.department : user.department;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.upiId = req.body.upiId !== undefined ? req.body.upiId.trim() : user.upiId;
      if (req.body.upiQrImage !== undefined) {
        user.upiQrImage = req.body.upiQrImage;
      }
      if (req.body.role && ['buyer', 'seller', 'both'].includes(req.body.role)) {
        user.role = req.body.role;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        token: generateToken(updatedUser._id),
        user: formatUserPayload(updatedUser)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getVerifiedUsers = async (req, res, next) => {
  try {
    const verifiedUsers = await User.find({ isVerified: true })
      .select('name college department year hostel roomNumber role rating totalReviews profileImage isVerified createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach active listings count for each verified user
    const Product = require('../models/Product');
    const userIds = verifiedUsers.map(u => u._id);
    const productCounts = await Product.aggregate([
      { $match: { seller: { $in: userIds }, status: 'available' } },
      { $group: { _id: '$seller', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    productCounts.forEach(pc => {
      countMap[pc._id.toString()] = pc.count;
    });

    const enrichedUsers = verifiedUsers.map(u => ({
      ...u,
      listingsCount: countMap[u._id.toString()] || 0
    }));

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Student user not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete current student's account:
 * - Removes all listed products
 * - Removes all active offers and favorites
 * - Marks conversations with "User deleted account" system notice
 * - Tombstones user profile as Deleted User
 */
exports.deleteMyAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const Product = require('../models/Product');
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const Offer = require('../models/Offer');
    const Favorite = require('../models/Favorite');
    const Review = require('../models/Review');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Delete all products listed by this user
    const deletedProductsResult = await Product.deleteMany({ seller: userId });

    // 2. Delete offers and favorites
    await Offer.deleteMany({ $or: [{ buyer: userId }, { seller: userId }] });
    await Favorite.deleteMany({ user: userId });
    await Review.deleteMany({ reviewer: userId });

    // 3. Update all conversations involving this user
    const conversations = await Conversation.find({ participants: userId });
    for (const conv of conversations) {
      const sysMsg = await Message.create({
        conversation: conv._id,
        sender: userId,
        content: '🚫 [User deleted account]',
        type: 'text',
        read: true
      });
      conv.lastMessage = sysMsg._id;
      conv.updatedAt = new Date();
      await conv.save();

      // Emit real-time socket event to the other participant if online
      const io = req.app.get('io');
      if (io) {
        const otherParticipant = conv.participants.find(p => p.toString() !== userId.toString());
        if (otherParticipant) {
          io.to(otherParticipant.toString()).emit('user deleted', {
            chatId: conv._id,
            deletedUserId: userId.toString(),
            message: 'User has deleted their account'
          });
        }
      }
    }

    // 4. Mark user account as deleted
    user.isDeleted = true;
    user.name = 'Deleted User';
    user.email = `deleted_${userId}_${Date.now()}@campusmart.deleted`;
    user.password = 'DELETED_ACCOUNT';
    user.phone = '';
    user.bio = 'This user has deleted their account.';
    user.profileImage = 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff';
    await user.save();

    res.json({
      success: true,
      message: 'Account and all associated products successfully deleted',
      deletedProductsCount: deletedProductsResult.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

