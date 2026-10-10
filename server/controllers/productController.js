const Product = require('../models/Product');
const { uploadToCloudinary } = require('../middleware/upload');

exports.createProduct = async (req, res, next) => {
  try {
    let imageUrls = [];
    
    // Handle image uploads if files exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    const { title, description, price, category, condition, college, hostel, tags, negotiable } = req.body;

    const product = await Product.create({
      title,
      description,
      price: Number(price) || 0,
      category,
      condition: condition || 'good',
      college: college || req.user.college || 'VIT Bhopal University',
      hostel: hostel || req.user.hostel || 'Campus Hostel',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      seller: req.user._id,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'],
      negotiable: negotiable === 'false' ? false : true,
      status: 'available'
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, condition, keyword, sort, limit, seller, status } = req.query;
    
    let query = {};
    if (seller) {
      query.seller = seller;
      if (status) query.status = status;
    } else {
      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: 'sold' };
      }
    }
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    let sortOption = { updatedAt: -1, createdAt: -1 }; // Default sort by latest updated/relisted or created
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { updatedAt: -1, createdAt: -1 };

    let queryExec = Product.find(query)
      .populate('seller', 'name college hostel roomNumber isVerified profileImage rating')
      .sort(sortOption);

    if (limit) {
      queryExec = queryExec.limit(Number(limit));
    }

    const products = await queryExec;

    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name college hostel roomNumber isVerified profileImage rating joinedAt');
      
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const isSeller = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isStatusToggle = Object.keys(req.body).every(k => ['status', 'updatedAt'].includes(k));

    if (!isSeller && !isAdmin && !isStatusToggle) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };
    if (req.body.status === 'available') {
      updateData.updatedAt = new Date();
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (error) {
    next(error);
  }
};
