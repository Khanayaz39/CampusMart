require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  {
    title: 'Engineering Mathematics (Advanced Edition)',
    description: 'Calculus, Differential Equations, and Linear Algebra. Great condition, minimal pencil notes.',
    price: 350,
    category: 'Books & Notes',
    condition: 'good',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 1',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'],
    tags: ['textbook', 'math', 'semester1']
  },
  {
    title: 'Data Structures and Algorithms in C++',
    description: 'Standard textbook for CSE/IT. Helpful for semester exam and interview prep.',
    price: 420,
    category: 'Books & Notes',
    condition: 'like-new',
    college: 'CampusMart College',
    hostel: 'Girls Hostel 2',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600'],
    tags: ['cse', 'coding', 'algorithms']
  },
  {
    title: 'HP Pavilion 15 Laptop (Core i5, 8GB, 512GB SSD)',
    description: 'Smooth performance for programming, projects, and movies. Charger and laptop bag included.',
    price: 28500,
    category: 'Electronics',
    condition: 'like-new',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 3',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600'],
    tags: ['laptop', 'hp', 'electronics']
  },
  {
    title: 'JBL Flip 5 Bluetooth Speaker',
    description: 'Crisp sound, deep bass, waterproof. Battery lasts 10+ hours. Mint condition.',
    price: 2600,
    category: 'Electronics',
    condition: 'good',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 2',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600'],
    tags: ['jbl', 'music', 'speaker']
  },
  {
    title: 'Wooden Hostel Study Table with Drawer',
    description: 'Sturdy wooden table, fits neatly in any standard hostel room. Good condition.',
    price: 1400,
    category: 'Furniture',
    condition: 'good',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 1',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600'],
    tags: ['table', 'study', 'furniture']
  },
  {
    title: 'Ergonomic Mesh Revolving Chair',
    description: 'Adjustable height, lumbar support. Super comfortable for long study nights.',
    price: 2200,
    category: 'Furniture',
    condition: 'like-new',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 2',
    images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=600'],
    tags: ['chair', 'study', 'furniture']
  },
  {
    title: 'Firefox 21-Speed Gear Bicycle',
    description: 'Equipped with front suspension and bell. Serviced last month, great for traveling across campus.',
    price: 4300,
    category: 'Transport',
    condition: 'fair',
    college: 'CampusMart College',
    hostel: 'Campus Cycles Stand',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600'],
    tags: ['cycle', 'firefox', 'transport']
  },
  {
    title: 'Pigeon 1.5L Electric Kettle',
    description: 'Must-have for hostel room (instant noodles, tea, warm water). Works perfectly.',
    price: 550,
    category: 'Kitchen Items',
    condition: 'good',
    college: 'CampusMart College',
    hostel: 'Girls Hostel 1',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600'],
    tags: ['kettle', 'hostel', 'kitchen']
  },
  {
    title: 'Philips 6-Socket Extension Board with Surge Protection',
    description: 'Long 3-meter cord, 6 sockets with individual switches and indicator.',
    price: 390,
    category: 'Electrical',
    condition: 'new',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 4',
    images: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=600'],
    tags: ['extension', 'electrical', 'room']
  },
  {
    title: 'Formal College Blazer (Navy Blue, Size 38)',
    description: 'Worn only twice during campus presentation and fest. Clean, spotless.',
    price: 850,
    category: 'Clothing',
    condition: 'like-new',
    college: 'CampusMart College',
    hostel: 'Boys Hostel 2',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'],
    tags: ['clothing', 'blazer', 'formals']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // 1. Create a demo student seller if none exists
    let demoSeller = await User.findOne({ email: 'rahul.sharma@college.edu' });
    if (!demoSeller) {
      demoSeller = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul.sharma@college.edu',
        password: 'password123',
        phone: '9876543210',
        role: 'seller',
        college: 'CampusMart Institute of Technology',
        department: 'Computer Science',
        year: 3,
        hostel: 'Boys Hostel 2',
        roomNumber: '204',
        rating: 4.8,
        totalReviews: 14,
        isVerified: true,
        verificationStatus: { email: true, phone: true, college: true }
      });
      console.log('✅ Demo student user created: rahul.sharma@college.edu');
    }

    // 2. Clear old demo products and insert fresh ones
    await Product.deleteMany({ seller: demoSeller._id });
    const productsToInsert = sampleProducts.map(p => ({
      ...p,
      seller: demoSeller._id
    }));

    await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully seeded ${productsToInsert.length} products to MongoDB Atlas!`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
