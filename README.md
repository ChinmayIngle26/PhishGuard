# PhishGuard: AI-Powered Phishing Detector

PhishGuard is a web application that uses AI to analyze URLs in real-time and protect users from sophisticated phishing attacks. It comes with a functional front-end, a Next.js backend with an AI-powered analysis endpoint, and a browser extension.

## Features

-   **AI-Powered Scanning:** Leverages generative AI to analyze URLs for phishing, brand impersonation, and social engineering tactics.
-   **AI Email Analysis:** Scans email content for common phishing red flags.
-   **Real-time Threat Feed:** A live-updating feed of dangerous URLs detected by the community.
-   **User Authentication:** Sign up and log in with Email/Password or Google.
-   **Browser Extension:** A companion browser extension to scan the current page's URL with a single click.
-   **User Reputation System:** A framework for rewarding users for providing feedback on scan accuracy.

## Tech Stack

-   **Framework:** Next.js (App Router)
-   **AI:** Genkit with Google Gemini
-   **Database:** Firestore
-   **Authentication:** Firebase Authentication
-   **UI:** React, ShadCN UI, Tailwind CSS
-   **Language:** TypeScript

---

## Local Development Setup

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Install Dependencies

Install the necessary packages for the project.

```bash
npm install
```

### 2. Set up Firebase

You will need a Firebase project to handle user authentication, and a service account to allow the backend to manage user data securely.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project if you don't have one already.

2.  **Add a Web App:** In your project's settings, add a new web application. Firebase will provide you with a `firebaseConfig` object.

3.  **Enable Authentication Methods:**
    *   In the Firebase Console, go to the **Authentication** section.
    *   Click on the **Sign-in method** tab.
    *   Enable both **Email/Password** and **Google** as sign-in providers.

4.  **Create a Firestore Database:**
    *   Go to the **Firestore Database** section in the Firebase Console.
    *   Click **Create database** and start in **Production mode**. Choose a location closest to you.
    *   You will need to create security rules later.

5.  **Generate a Service Account Key (for the backend):**
    *   In your Firebase project, go to **Project settings** (click the gear icon).
    *   Go to the **Service accounts** tab.
    *   Click **Generate new private key**. A JSON file will be downloaded. **Keep this file secure and do not commit it to your repository.**

### 3. Configure Environment Variables

Create a new file named `.env` in the root of the project. Copy your Firebase web app configuration into it, and add keys for your AI and service account.

1.  **For the Frontend:**
    *   Copy the `firebaseConfig` values from your web app settings.
    *   Prefix each key with `NEXT_PUBLIC_`.

2.  **For the Backend:**
    *   **`GEMINI_API_KEY`**: Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **`FIREBASE_SERVICE_ACCOUNT_BASE64`**: This is crucial. You can't put the JSON file directly in `.env`. Instead, you must encode it.
        *   Open the JSON file you downloaded.
        *   Copy its entire content.
        *   Go to a site like [base64encode.org](https://www.base64encode.org/), paste the JSON content, and click "Encode".
        *   Copy the resulting long string. This is what you will paste into your `.env` file.

Your `.env` file should look like this:

```
# Frontend Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Backend Keys
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
FIREBASE_SERVICE_ACCOUNT_BASE64="YOUR_BASE64_ENCODED_SERVICE_ACCOUNT_JSON"
```

### 4. Run the Development Server

Start the Next.js development server. By default, it runs on port 9002.

```bash
npm run dev
```

You should now be able to access the application at `http://localhost:9002`.

---

## Deployment to Vercel

### Environment Variables

When you deploy your application to Vercel, you **must** add your environment variables to the project settings. The `.env` file is only for local development and is not uploaded.

**IMPORTANT:** The application will fail if these variables are not set correctly in your Vercel project.

1.  Go to your project's dashboard on Vercel.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add all the variables from your `.env` file. You need to add each one, including all the `NEXT_PUBLIC_FIREBASE_...` keys, the `GEMINI_API_KEY`, and the `FIREBASE_SERVICE_ACCOUNT_BASE64`.
4.  Redeploy your application for the changes to take effect.

---

## Using the Browser Extension

The `/extension` directory contains the files for the browser extension.

### How to Load the Extension (in Chrome/Edge)

1.  Open your browser and navigate to the extensions page (`chrome://extensions` or `edge://extensions`).
2.  Enable **Developer mode** (usually a toggle switch in the top-right corner).
3.  Click the **Load unpacked** button.
4.  Select the `extension` folder from this project's directory.

The PhishGuard icon should now appear in your browser's toolbar.

### Connecting the Extension to your Deployed App

**IMPORTANT:** For the extension to work with your deployed Vercel application, you must update the API URLs in the extension's files.

1.  Open `extension/popup.js`.
2.  Open `extension/background.js`.
3.  In both files, replace the placeholder `https://phishguard-testapp.vercel.app` with your actual Vercel deployment URL.
4.  After saving the files, go back to `chrome://extensions` and click the "Reload" button for the PhishGuard extension.
