import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgx4Wd2SdpLhAknjo61NU1HWyZZkm0ivM",
  authDomain: "nxa-talent.firebaseapp.com",
  projectId: "nxa-talent",
  storageBucket: "nxa-talent.firebasestorage.app",
  messagingSenderId: "129338661158",
  appId: "1:129338661158:web:0b2a3958668c22fd7189e7",
  measurementId: "G-NJT1R8H4LG"
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";
if (isConfigured && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully via bundled NPM SDK. Real-time Cloud sync active.");
}

// Expose globally for backward compatibility across all legacy components
if (typeof window !== 'undefined') {
  window.firebase = firebase;
}

export default firebase;
