import { beforeAll, afterAll } from 'vitest';
import { connectDB, closeDB } from '../config/database';

beforeAll(async () => {
  // Setup test database connection if needed
  // await connectDB();
});

afterAll(async () => {
  // Cleanup
  await closeDB();
});

