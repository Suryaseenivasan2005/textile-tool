import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, getDB, closeDB } from './config/database';
import { DB_CONFIG } from './constants';

dotenv.config();

const seedUser = async () => {
  try {
    await connectDB();
    const db = getDB();
    const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

    const mobile = '9688257055';
    const password = 'sms@135';
    const name = 'Admin User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ mobile });
    if (existingUser) {
      // Update existing user password
      await usersCollection.updateOne(
        { mobile },
        {
          $set: {
            password: hashedPassword,
            name,
            updatedAt: new Date(),
          },
        }
      );
      console.log('✅ Default user password updated!');
      console.log(`   Mobile: ${mobile}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID: ${existingUser._id}`);
    } else {
      // Create new user
      const result = await usersCollection.insertOne({
        mobile,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Default user created successfully!');
      console.log(`   Mobile: ${mobile}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID: ${result.insertedId}`);
    }

    await closeDB();
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    await closeDB();
    process.exit(1);
  }
};

seedUser();

