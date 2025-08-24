
import { config } from 'dotenv';
config({ path: '.env' });

import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin immediately for the dev server.
try {
  initializeFirebaseAdmin();
} catch (e) {
    // Log the error but don't prevent the server from starting
    // as some functionalities might not depend on it.
    console.error("Failed to initialize Firebase Admin SDK during dev server startup. Some features might not work.", e);
}

// Import flows after environment variables and initializations are set up.
import '@/ai/flows/enhance-detection-accuracy.ts';
import '@/ai/flows/analyze-email-flow.ts';
