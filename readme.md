CreaTECH Mobile Application Setup

This document outlines the mandatory installation and configuration steps required to run the CreaTECH mobile application.

📦 1. Installation of Required Dependencies

The application relies on several third-party libraries for functionality, security, and persistence. Run the following commands in your project terminal:

A. Core Libraries (Firebase, AsyncStorage, SafeArea)

# Installs core Firebase, Firestore, AsyncStorage (for session persistence), and modern SafeArea component.
npm install firebase react-native-safe-area-context @react-native-async-storage/async-storage@2.2.0

# Install the necessary Babel preset for Expo (if not already present)
npm install babel-preset-expo


B. Security & Social Login

# Security: Reads secrets from the .env file
npm install react-native-dotenv

# Social Login: Expo Facebook SDK
npx expo install expo-facebook


🔒 2. .env Setup

Your Firebase API keys must be kept secret and never committed to Git. This project uses the react-native-dotenv library to securely manage these secrets.

2.1 Create the .env File

Create a file named .env in the root directory of the project (next to package.json).

Inside this file, you must list the Firebase configuration keys in the KEY=VALUE format sent in the messenger group chat:

# .env file content (Keys must contain any "")
FIREBASE_API_KEY=YOUR_API_KEY_HERE
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
