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

// 2) Init Firebase + Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;

// authentification anonyme
export function ensureAuth() {
  return new Promise((resolve, reject) => {
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
}
// ---------- helpers pour tableaux ----------
// Firestore n'accepte PAS set([]) : un doc doit être un objet.
// On emballe les tableaux : { __type:"array", items:[...] }

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

// 3) Fonctions Firestore simples
async function cloudGetJSON(key, fallback) {
  try {
    const snap = await db.collection("accueilcs").doc(key).get();
    if (!snap.exists) return fallback;
    const raw = snap.data();
    const val = denormalizeFromCloud(raw);
    return val;
  } catch (e) {
    console.error("cloudGetJSON error", key, e);
    return fallback;
  }
}

async function cloudSetJSON(key, value) {
  try {
    const toSave = normalizeForCloud(value);
    await db.collection("accueilcs").doc(key).set(toSave);
    console.log("[cloudSetJSON] OK", key, toSave);
  } catch (e) {
    console.error("cloudSetJSON error", key, e);
  }
}

window.cloudGetJSON  = cloudGetJSON;
window.cloudSetJSON  = cloudSetJSON;

// 4) Quelles clés on synchronise
function shouldSyncKey(key){
  if(!key) return false;
  return key === "fma_data_v2"
      || key === "csver_themes"          // ancienne clé globale
      || key.startsWith("csver_themes_") // 🔴 thèmes par CIS
      || key === "manoeuvre_repli_v1"    // 🔵 manœuvres de repli (tous CIS)
      || key.startsWith("repli_lock_")   // 🔵 verrou manœuvre par CIS
      || key.startsWith("vehicules_")
      || key.startsWith("journal_")
      || key.startsWith("reservations_")
      || key.startsWith("habillement_")
      || key.startsWith("messages_")
      || key.startsWith("csver_user_")
      || key.startsWith("consignes_");   // 🟣 consignes par CIS
}

window.shouldSyncKey = shouldSyncKey;

// 5) Cloud ➜ localStorage (appelé au chargement de CHAQUE page)
async function syncAccueilFromCloud(){
  try{
    const snap = await db.collection("accueilcs").get();

    // On mémorise toutes les clés réellement présentes dans Firestore
    const seenKeys = new Set();

    snap.forEach(doc=>{
      const id = doc.id;
      if(shouldSyncKey(id)){
        seenKeys.add(id);
        try {
          const raw = doc.data();
          const val = denormalizeFromCloud(raw);
          localStorage.setItem(id, JSON.stringify(val));
        } catch(e){
          console.error("Erreur cache local pour", id, e);
        }
      }
    });

    // 🧹 Nettoyage : on supprime du localStorage les clés qui n'existent plus dans Firestore
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (shouldSyncKey(k) && !seenKeys.has(k)) {
        // Cette clé était synchronisée mais n'existe plus dans le cloud → on la supprime localement
        localStorage.removeItem(k);
        i--; // car localStorage.length vient de changer
      }
    }

    console.log("ACCUEIL-CS : sync Firestore → localStorage OK (avec nettoyage)");
  }catch(e){
    console.error("syncAccueilFromCloud", e);
  }
}
window.syncAccueilFromCloud = syncAccueilFromCloud;


// 6) localStorage ➜ Cloud (interception globale)
(function(){
  const origSet = localStorage.setItem.bind(localStorage);
  const origRem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function(key, value){
    origSet(key, value);
    if(shouldSyncKey(key)){
      try{
        const obj = JSON.parse(value);
        cloudSetJSON(key, obj);
      }catch(e){
        console.error("cloudSetJSON error pour", key, e);
      }
    }
  };

  localStorage.removeItem = function(key){
    if(shouldSyncKey(key)){
      db.collection("accueilcs").doc(key)
        .delete()
        .catch(err => console.warn("Suppression Firestore échouée", err));
    }
    origRem(key);
  };
})();



