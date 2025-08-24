
import * as admin from 'firebase-admin';

// Export the admin instance directly. The initialization will be handled by a function.
export const adminInstance = admin;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called before any Firebase Admin services are used.
 * It uses a Base64 encoded service account for robustness.
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return; // Already initialized
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error(
      'Firebase Admin initialization failed. The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is missing. Please add it to your .env file.'
    );
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
  } catch (error: any) {
    // Provide a more detailed error message to help diagnose the issue.
    throw new Error(
      `Firebase Admin initialization failed with a credential parsing error: ${error.message}. Please ensure the FIREBASE_SERVICE_ACCOUNT_BASE64 value is a valid, non-corrupted Base64 string from your service account JSON file.`
    );
  }
}

// Export the initialized services as getters to ensure initialization has occurred.
export const adminDb = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

export const adminAuth = () => {
  initializeFirebaseAdmin();
  return admin.auth();
};
