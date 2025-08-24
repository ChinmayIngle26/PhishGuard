
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Firebase Admin initialization failed. The following environment variables are missing: ${missingEnvVars.join(
      ', '
    )}. Please add them to your .env file.`
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly in the .env file.
        // It should be enclosed in quotes and have newlines represented as \\n
        privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error);
    throw new Error(`Firebase Admin initialization failed: ${error.message}. Please check your Firebase credentials in the .env file.`);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
