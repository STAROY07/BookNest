/**
 * BookNest - Firebase Configuration & Initialization
 * Supports live Firebase project connection with fallback to local persistent data store.
 */

// Replace the placeholder values below with your Firebase Project credentials,
// or configure them dynamically via the Admin Settings page.
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDemoPlaceholderKeyForBookNestProject2026",
  authDomain: "booknest-app.firebaseapp.com",
  projectId: "booknest-app",
  storageBucket: "booknest-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Check if user has saved customized Firebase credentials in localStorage
const savedConfig = localStorage.getItem('booknest_firebase_config');
const firebaseConfig = savedConfig ? JSON.parse(savedConfig) : defaultFirebaseConfig;

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let firebaseStorage = null;
let isFirebaseLive = false;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
    firebaseStorage = firebase.storage ? firebase.storage() : null;
    isFirebaseLive = true;
    console.log("BookNest: Firebase SDK initialized successfully.");
  }
} catch (error) {
  console.warn("BookNest: Firebase initialized in standalone fallback mode:", error.message);
  isFirebaseLive = false;
}

window.BookNestFirebase = {
  app: firebaseApp,
  auth: firebaseAuth,
  db: firestoreDb,
  storage: firebaseStorage,
  isLive: isFirebaseLive,
  config: firebaseConfig,
  saveCustomConfig: (newConfig) => {
    localStorage.setItem('booknest_firebase_config', JSON.stringify(newConfig));
    window.location.reload();
  },
  resetDefaultConfig: () => {
    localStorage.removeItem('booknest_firebase_config');
    window.location.reload();
  }
};
