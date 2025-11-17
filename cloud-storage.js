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

// ---------- helpers pour tableaux ----------

// On ne peut PAS faire set([]) directement sur Firestore.
// On emballe les tableaux sous la forme { __type:"array", items:[...] }
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
    // petit log debug
    console.log("[cloudSetJSON] PUSH", key, toSave);
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
      || key === "csver_themes"
      || key.startsWith("vehicules_")
      || key.startsWith("journal_")
      || key.startsWith("reservations_")
      || key.startsWith("habillement_")
      || key.startsWith("messages_")
      || key.startsWith("csver_user_");   // droits / permissions
}
window.shouldSyncKey = shouldSyncKey;

// 5) Cloud ➜ localStorage (appelé au chargement de CHAQUE page)
async function syncAccueilFromCloud(){
  try{
    const snap = await db.collection("accueilcs").get();
    snap.forEach(doc=>{
      const id = doc.id;
      if(shouldSyncKey(id)){
        try {
          const raw = doc.data();
          const val = denormalizeFromCloud(raw);
          localStorage.setItem(id, JSON.stringify(val));
        } catch(e){
          console.error("Erreur cache local pour", id, e);
        }
      }
    });
    console.log("ACCUEIL-CS : sync Firestore → localStorage OK");
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
