// cloud-storage.js
// ✅ MODULE ES UNIQUEMENT

// ⚠️ Firebase DOIT déjà être initialisé AVANT ce fichier

const auth = firebase.auth();
const db   = firebase.firestore();

/* ================= AUTH ANONYME ================= */
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;

  const cred = await auth.signInAnonymously();
  return cred.user;
}

/* ================= NORMALISATION ================= */
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

/* ================= FIRESTORE API ================= */
export async function cloudGetJSON(key, fallback = null) {
  try {
    const snap = await db.collection("accueilcs").doc(key).get();
    if (!snap.exists) return fallback;
    return denormalizeFromCloud(snap.data());
  } catch (e) {
    console.error("cloudGetJSON error:", key, e);
    return fallback;
  }
}

export async function cloudSetJSON(key, value) {
  try {
    await db
      .collection("accueilcs")
      .doc(key)
      .set(normalizeForCloud(value), { merge: true });
  } catch (e) {
    console.error("cloudSetJSON error:", key, e);
  }
}

/* ================= SYNC RULES ================= */
export function shouldSyncKey(key) {
  if (!key) return false;
  return key === "fma_data_v2"
    || key.startsWith("csver_themes_")
    || key.startsWith("vehicules_")
    || key.startsWith("journal_")
    || key.startsWith("reservations_")
    || key.startsWith("habillement_")
    || key.startsWith("messages_")
    || key.startsWith("csver_user_")
    || key.startsWith("consignes_");
}

/* ================= CLOUD ➜ LOCAL ================= */
export async function syncAccueilFromCloud() {
  try {
    const snap = await db.collection("accueilcs").get();
    snap.forEach(doc => {
      if (shouldSyncKey(doc.id)) {
        localStorage.setItem(
          doc.id,
          JSON.stringify(denormalizeFromCloud(doc.data()))
        );
      }
    });
    console.log("Sync Firestore → localStorage OK");
  } catch (e) {
    console.error("syncAccueilFromCloud", e);
  }
}

export { db };
