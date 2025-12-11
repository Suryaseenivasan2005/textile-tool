import { MongoClient, Db } from 'mongodb';
import { DB_CONFIG } from '../constants';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/tex-tool';
let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(DB_CONFIG.DATABASE_NAME);
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};
