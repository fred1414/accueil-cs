// cloud-storage.js
// Firebase DOIT déjà être initialisé dans le HTML

(function () {
  if (!window.firebase) {
    console.error("Firebase non chargé");
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // ================= Auth anonyme =================
  let authReady = null;

  async function ensureAnonymousAuth() {
    if (authReady) return authReady;

    authReady = new Promise((resolve, reject) => {
      auth.onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          auth.signInAnonymously()
            .then(cred => resolve(cred.user))
            .catch(reject);
        }
      });
    });

    return authReady;
  }

  // ================= Utils =================
  function normalizeForCloud(value) {
    if (Array.isArray(value)) {
      return { __type: "array", items: value };
    }
    return value;
  }

  function denormalizeFromCloud(value) {
    if (value && value.__type === "array" && Array.isArray(value.items)) {
      return value.items;
    }
    return value;
  }

  function shouldSyncKey(key) {
    return (
      key === "fma_data_v2" ||
      key.startsWith("csver_user_") ||
      key.startsWith("csver_themes_") ||
      key.startsWith("journal_") ||
      key.startsWith("vehicules_") ||
      key.startsWith("messages_")
    );
  }

  // ================= Firestore API =================
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
      await db.collection("accueilcs").doc(key).set(
        normalizeForCloud(value),
        { merge: true }
      );
    } catch (e) {
      console.error("cloudSetJSON failed:", key, e);
    }
  }

  async function syncAccueilFromCloud() {
    try {
      await ensureAnonymousAuth();
      const snap = await db.collection("accueilcs").get();

      snap.forEach(doc => {
        const key = doc.id;
        if (!shouldSyncKey(key)) return;
        const value = denormalizeFromCloud(doc.data());
        localStorage.setItem(key, JSON.stringify(value));
      });

      console.log("Firestore → localStorage synchronisé");
    } catch (e) {
      console.error("syncAccueilFromCloud failed", e);
    }
  }

  // ================= Exposition globale =================
  window.cloudGetJSON = cloudGetJSON;
  window.cloudSetJSON = cloudSetJSON;
  window.syncAccueilFromCloud = syncAccueilFromCloud;
})();

