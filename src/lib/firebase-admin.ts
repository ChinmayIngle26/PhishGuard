
import * as admin from 'firebase-admin';

// Export the admin instance directly. The initialization will be handled by a function.
export const adminInstance = admin;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called once when the server starts.
 * It uses a Base64 encoded service account for robustness.
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    console.log('Firebase Admin SDK already initialized.');
    return; // Already initialized
  }

  console.log('Attempting to initialize Firebase Admin SDK...');
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    console.error(
      'Firebase Admin initialization failed: The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is missing. Please add it to your .env file.'
    );
    throw new Error(
      'Firebase Admin initialization failed. The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is missing.'
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
    console.error(
      `Firebase Admin initialization failed with a credential parsing error: ${error.message}. Please ensure the FIREBASE_SERVICE_ACCOUNT_BASE64 value is a valid, non-corrupted Base64 string from your service account JSON file.`
    );
    // Re-throw the error to prevent the application from running with a misconfigured Firebase Admin.
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// Immediately attempt to initialize on module load for server environments.
initializeFirebaseAdmin();

// Export the initialized services as getters to ensure initialization has occurred.
export const adminDb = () => {
  if (admin.apps.length === 0) {
    // This case should ideally not be hit if initialization is handled correctly on startup.
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

export const adminAuth = () => {
  if (admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};
