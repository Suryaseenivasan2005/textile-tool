import { MongoClient, Db } from 'mongodb';
import { DB_CONFIG } from '../constants';

// CRITICAL: DATABASE_URL must be set in environment variables
const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error('❌ FATAL ERROR: DATABASE_URL environment variable is not set!');
  console.error('   Please configure DATABASE_URL in your .env file or deployment platform.');
  throw new Error('DATABASE_URL is required but not configured');
}

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) {
    console.log('✅ Using existing MongoDB connection');
    return db;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   Database: ${DB_CONFIG.DATABASE_NAME}`);
    // Log sanitized connection string (hide password)
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`   URI: ${sanitizedUri}`);

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(DB_CONFIG.DATABASE_NAME);

    // Verify connection by pinging the database
    await db.command({ ping: 1 });

    console.log('✅ Successfully connected to MongoDB');
    console.log(`   Database: ${DB_CONFIG.DATABASE_NAME}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('   Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('   Stack:', error.stack);
    }
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
