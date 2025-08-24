
import * as admin from 'firebase-admin';

// Export the admin instance directly. The initialization will be handled by a function.
export const adminInstance = admin;

let isInitialized = false;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be idempotent (safe to call multiple times).
 */
export function initializeFirebaseAdmin() {
  if (isInitialized) {
    return;
  }

  // Prevent re-initialization in the same process
  if (admin.apps.length > 0) {
    isInitialized = true;
    return;
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    console.warn(
      'Firebase Admin SDK not initialized. The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is missing. Server-side Firebase features will be disabled.'
    );
    return;
  }

  try {
    const decodedServiceAccount = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');

    const serviceAccount = JSON.parse(decodedServiceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully.');
    isInitialized = true;
  } catch (error: any) {
    console.error(
      `Firebase Admin initialization failed. Please ensure FIREBASE_SERVICE_ACCOUNT_BASE64 is a valid Base64 string from your service account JSON file. Error: ${error.message}`
    );
    // Do not throw here, but log the error. The app can run without admin features.
  }
}


// Export the initialized services as getters.
// This ensures that we are always getting the service from the initialized app.
export const adminDb = () => {
  if (!isInitialized) {
    throw new Error('Firebase Admin SDK has not been initialized. Cannot access Firestore.');
  }
  return admin.firestore();
};

export const adminAuth = () => {
  if (!isInitialized) {
    throw new Error('Firebase Admin SDK has not been initialized. Cannot access Auth.');
  }
  return admin.auth();
};
