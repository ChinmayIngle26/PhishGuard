
import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  // This is the new, more robust method using a Base64 encoded service account.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decodedServiceAccount = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf-8');
      const serviceAccount = JSON.parse(decodedServiceAccount);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully via Base64.');
      return;
    } catch (error: any) {
      throw new Error(`Firebase Admin initialization via Base64 failed: ${error.message}`);
    }
  }

  // Fallback to the old method if the new one isn't configured.
  // This helps with backward compatibility but the Base64 method is preferred.
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin initialization failed. Missing required environment variables. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended) or all of NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.'
    );
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully via individual variables.');
  } catch (error: any) {
    throw new Error(`Firebase Admin initialization via individual variables failed: ${error.message}`);
  }
}

// Run the initialization
initializeFirebaseAdmin();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
