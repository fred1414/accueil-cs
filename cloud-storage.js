// cloud-storage.js

// ✅ Configuration Firebase de ton projet
const firebaseConfig = {
  apiKey: "AIzaSyD1IxHONTei5-T0t1XrvQ1RC_gCcih4A7T4",
  authDomain: "accueil-cs.firebaseapp.com",
  projectId: "accueil-cs",
  storageBucket: "accueil-cs.firebasestorage.app",
  messagingSenderId: "292270758652",
  appId: "1:292270758652:web:f6b56f208e5c4b374fd579",
  measurementId: "G-2FB4N537JW"
};

// ✅ Initialisation Firebase + Firestore (version compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/**
 * Lit un document JSON dans Firestore.
 * key ex : "csver_user_1414"
 */
async function cloudGetJSON(key, fallback) {
  try {
    const docRef = db.collection("accueilcs").doc(key);
    const snap = await docRef.get();
    if (!snap.exists) return fallback;
    return snap.data();   // ⚠️ on renvoie directement tous les champs du doc
  } catch (e) {
    console.error("cloudGetJSON error", key, e);
    return fallback;
  }
}

/**
 * Écrit un document JSON dans Firestore
 * value est un objet (user, véhicules, etc.)
 */
async function cloudSetJSON(key, value) {
  try {
    const docRef = db.collection("accueilcs").doc(key);
    await docRef.set(value);   // on stocke directement l'objet
  } catch (e) {
    console.error("cloudSetJSON error", key, e);
  }
}
