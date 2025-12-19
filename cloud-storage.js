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

// cloud-storage.js
// Version SAFE — Firebase compat + Auth anonyme + Firestore
// Aucune syntaxe module / export

(function () {

  /* ================== Sécurité Firebase ================== */

  if (typeof firebase === "undefined") {
    console.error("Firebase SDK non chargé");
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  window.db = db;

  /* ================== Auth anonyme ================== */

  let authReady = false;
  let authPromise = null;

  function ensureAnonymousAuth() {
    if (authReady) return Promise.resolve(auth.currentUser);

    if (authPromise) return authPromise;

    authPromise = new Promise((resolve, reject) => {
      auth.onAuthStateChanged(user => {
        if (user) {
          authReady = true;
          resolve(user);
        } else {
          auth.signInAnonymously()
            .then(cred => {
              authReady = true;
              resolve(cred.user);
            })
            .catch(err => {
              console.error("Auth anonyme échouée", err);
              reject(err);
            });
        }
      });
    });

    return authPromise;
  }

  /* ================== Helpers sérialisation ================== */

  function normalizeForCloud(value) {
    if (Array.isArray(value)) {
      return { __type: "array", items: value };
    }
    return value;
  }

  function denormalizeFromCloud(data) {
    if (data && data.__type === "array" && Array.isArray(data.items)) {
      return data.items;
    }
    return data;
  }

  /* ================== API Cloud ================== */

  async function cloudGetJSON(key, fallback = null) {
    try {
      await ensureAnonymousAuth();
      const snap = await db.collection("accueilcs").doc(key).get();
      if (!snap.exists) return fallback;
      return denormalizeFromCloud(snap.data());
    } catch (e) {
      console.warn("cloudGetJSON failed:", key, e);
      return fallback;
    }
  }

  async function cloudSetJSON(key, value) {
    try {
      await ensureAnonymousAuth();
      const payload = normalizeForCloud(value);
      await db.collection("accueilcs").doc(key).set(payload, { merge: true });
      console.log("[cloudSetJSON] OK", key);
    } catch (e) {
      console.error("cloudSetJSON failed:", key, e);
    }
  }

  /* ================== Sync Cloud → localStorage ================== */

  function shouldSyncKey(key) {
    return key &&
      (
        key.startsWith("csver_user_") ||
        key.startsWith("csver_themes") ||
        key.startsWith("vehicules_") ||
        key.startsWith("journal_") ||
        key.startsWith("reservations_") ||
        key.startsWith("habillement_") ||
        key.startsWith("messages_") ||
        key.startsWith("consignes_") ||
        key === "fma_data_v2" ||
        key === "manoeuvre_repli_v1"
      );
  }

  async function syncAccueilFromCloud() {
    try {
      await ensureAnonymousAuth();
      const snap = await db.collection("accueilcs").get();

      snap.forEach(doc => {
        const key = doc.id;
        if (!shouldSyncKey(key)) return;

        const val = denormalizeFromCloud(doc.data());
        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
          console.error("LocalStorage write failed:", key, e);
        }
      });

      console.log("Sync Firestore → localStorage OK");
    } catch (e) {
      console.error("syncAccueilFromCloud failed", e);
    }
  }

  /* ================== Exposition globale ================== */

  window.ensureAnonymousAuth = ensureAnonymousAuth;
  window.cloudGetJSON = cloudGetJSON;
  window.cloudSetJSON = cloudSetJSON;
  window.syncAccueilFromCloud = syncAccueilFromCloud;
  window.shouldSyncKey = shouldSyncKey;

})();


