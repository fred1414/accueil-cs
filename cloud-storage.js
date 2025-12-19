// cloud-storage.js

// 1) Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1IxHONTei5-T0t1XrvQ1RC_gCcih4A7T4",
  authDomain: "accueil-cs.firebaseapp.com",
  projectId: "accueil-cs",
  storageBucket: "accueil-cs.firebasestorage.app",
  messagingSenderId: "292270758652",
  appId: "1:292270758652:web:f6b56f208e5c4b374fd579",
  measurementId: "G-2FB4N537JW"
};

// 2) Init Firebase (protégé)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 3) Services
const auth = firebase.auth();
const db   = firebase.firestore();

window.db = db;

// 4) Auth anonyme SIMPLE
async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await auth.signInAnonymously();
  return cred.user;
}

window.ensureAuth = ensureAuth;


