import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { generate10kProducts } from './generate10k.js';

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount >= 10000) {
      console.log(`[Seeder] Database already contains ${productCount} products. Skipping generation.`);
      return;
    }

    console.log('[Seeder] Initializing database with 10,000+ Flipkart products and Indian users...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // 1. Create Admin & Demo Customers
    const admin = await User.create({
      name: 'Rohan Sharma (Admin)',
      email: 'admin@panicdrop.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98765 43210',
      address: {
        street: 'Plot 42, 100ft Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
    });

    const customer = await User.create({
      name: 'Aarav Patel',
      email: 'customer@panicdrop.com',
      password: 'customer123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 91234 56789',
      address: {
        street: 'Flat 402, Cyber Heights, Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        country: 'India',
      },
    });

    const customer2 = await User.create({
      name: 'Priya Sundaram',
      email: 'priya@gmail.com',
      password: 'customer123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98111 22334',
      address: {
        street: 'B-12, Powai Lake View, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400076',
        country: 'India',
      },
    });

    // 2. Generate 10,000+ Products
    const count = await generate10kProducts(10000);

    // 3. Create Sample Orders
    const sampleProds = await Product.find().limit(5);
    if (sampleProds.length >= 2) {
      await Order.create({
        user: customer._id,
        orderItems: [
          {
            product: sampleProds[0]._id,
            name: sampleProds[0].name,
            image: sampleProds[0].images[0],
            price: sampleProds[0].price,
            quantity: 1,
          },
          {
            product: sampleProds[1]._id,
            name: sampleProds[1].name,
            image: sampleProds[1].images[0],
            price: sampleProds[1].price,
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: 'Aarav Patel',
          address: 'Flat 402, Cyber Heights, Hitec City',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500081',
          country: 'India',
          phone: '+91 91234 56789',
        },
        paymentMethod: 'UPI (GPay / PhonePe)',
        itemsPrice: sampleProds[0].price + sampleProds[1].price * 2,
        taxPrice: Math.round((sampleProds[0].price + sampleProds[1].price * 2) * 0.18),
        shippingPrice: 0,
        totalAmount: sampleProds[0].price + sampleProds[1].price * 2,
        isPaid: true,
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        orderStatus: 'shipped',
        trackingNumber: 'BLUEDART-IND-99201A',
      });
    }

    console.log(`[Seeder] Seeding completed with ${count} items.`);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
  }
};
