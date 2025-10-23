# 📱 CreaTECH Mobile Application Setup

This document outlines the mandatory installation and configuration steps required to set up and run the **CreaTECH mobile application**.

---

## 📦 1. Installation of Required Dependencies

The application relies on several third-party libraries for functionality, security, and data persistence.
Run the following commands in your project terminal:

### A. Core Libraries (Firebase, AsyncStorage, SafeArea)

Install the core Firebase packages, Firestore, AsyncStorage (for session persistence), and the modern SafeArea component:

```bash
npm install firebase react-native-safe-area-context @react-native-async-storage/async-storage@2.2.0
```

Install the necessary Babel preset for Expo (if not already installed):

```bash
npm install babel-preset-expo
```

---

### B. Security & Social Login

**Security:** Reads secrets from the `.env` file

```bash
npm install react-native-dotenv
```

**Social Login:** Install social login

```bash
npx expo install expo-facebook
npx expo install expo-auth-session expo-web-browser
```

---

## 🔒 2. Environment Variable Setup (`.env`)

The Firebase API keys must be kept **secret** and should **never** be committed to Git.
This project uses the `react-native-dotenv` library to securely manage these environment variables.

### 2.1 Create the `.env` File

Create a file named `.env` in the **root directory** of the project (next to `package.json`).

Inside this file, list the Firebase configuration keys in the `KEY=VALUE` format (the values will be provided through the **team’s messenger group chat**).

> ⚠️ **Important:** Do not wrap values in quotes (`""`).

**Example `.env` file:**

```env
FIREBASE_API_KEY=YOUR_API_KEY_HERE
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

✅ **You’re all set!**
Once dependencies are installed and your `.env` file is properly configured, you can proceed to run the project using:

```bash
npx expo start
```

---

**Author:** CreaTECH Development Team
**Last Updated:** *(October 23, 2025 - 11:20 PM)*
