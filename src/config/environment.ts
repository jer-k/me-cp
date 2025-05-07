import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url(),
  // Add more environment variables as needed
});

// Parse and export the environment configuration
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
});