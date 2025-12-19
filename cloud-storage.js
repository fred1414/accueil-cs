// cloud-storage.js
(function () {

  if (window.__CLOUD_STORAGE_READY__) return;
  window.__CLOUD_STORAGE_READY__ = true;


//  CONFIG
const firebaseConfig = {

  apiKey: "AIzaSyDlXhONTei5-T0t1XrvQ1RC_gCcih4A7T4",
  authDomain: "accueil-cs.firebaseapp.com",
  projectId: "accueil-cs",
  storageBucket: "accueil-cs.firebasestorage.app",
  messagingSenderId: "292270758652",
  appId: "1:292270758652:web:f6b56f208e5c4b374fd579",
  measurementId: "G-2FB4N537JW"

};


// 2? Init (UNE FOIS)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db   = firebase.firestore();

window.db = db;

// 3? Auth anonyme GARANTIE
let authReadyPromise = null;

function ensureAnonymousAuth() {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async user => {
      if (user) return resolve(user);

      try {
        const cred = await auth.signInAnonymously();
        resolve(cred.user);
      } catch (e) {
        reject(e);
      }
    });
  });

  return authReadyPromise;
}

window.ensureAnonymousAuth = ensureAnonymousAuth;

// 4? Helpers Firestore
async function cloudGetJSON(key, fallback = null) {
  await ensureAnonymousAuth();

  try {
    const snap = await db.collection("accueilcs").doc(key).get();
    return snap.exists ? snap.data() : fallback;
  } catch (e) {
    console.error("cloudGetJSON error", key, e);
    return fallback;
  }
}

async function cloudSetJSON(key, value) {
  await ensureAnonymousAuth();

  try {
    await db.collection("accueilcs").doc(key).set(value);
  } catch (e) {
    console.error("cloudSetJSON error", key, e);
  }
}

window.cloudGetJSON = cloudGetJSON;
window.cloudSetJSON = cloudSetJSON;
