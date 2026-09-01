import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[Database] MongoDB URI connection failed (${err.message}). Using High-Performance Embedded Store.`);
    }
  }

  // Try connecting to default local mongodb if running
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/panicdrop', {
      serverSelectionTimeoutMS: 1000,
    });
    console.log(`[Database] Connected to Local MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.log('[Database] Using Fast In-Memory Database Mode with Auto-Seeding.');
  }
};
