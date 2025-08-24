
import * as admin from 'firebase-admin';
require('dotenv').config({ path: '.env' });


let app: admin.app.App;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is idempotent (safe to call multiple times).
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0 && app) {
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

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error(
      `Firebase Admin initialization failed. Please ensure FIREBASE_SERVICE_ACCOUNT_BASE64 is a valid Base64 string from your service account JSON file. Error: ${error.message}`
    );
  }
}

// Call the initialization function when the module is first loaded.
initializeFirebaseAdmin();

// Export the initialized services as getters.
// This ensures that we are always getting the service from the initialized app.
export const adminDb = () => {
  if (!app) {
    throw new Error('Firebase Admin SDK has not been initialized. Cannot access Firestore.');
  }
  return admin.firestore(app);
};

export const adminAuth = () => {
   if (!app) {
    throw new Error('Firebase Admin SDK has not been initialized. Cannot access Auth.');
  }
  return admin.auth(app);
};
