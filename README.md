# Version 1.1: — Sécurisation 
## [2025-19-12]

### Sécurité
- Suppression de l’accès public à Firestore
- Activation de l’authentification Firebase anonyme
- Accès Firestore conditionné à `request.auth != null`
- /admin inaccessible anonymenebt ou sans role admin

### Authentification
- Ajout d’une connexion Firebase anonyme automatique (remplacement localStorage)
- Initialisation Firebase côté pages HTML

### Stockage
- Synchronisation Firestore (localStorage conservée)
- Synchronisation localStorage (Firestore conservée)
- Chargement initial des données depuis Firestore sans login préalable (remplacement localStorage)

### Pages impactées
- `login.html` : ajout de l’authentification Firebase anonyme
- `cloud-storage.js` : inchangé fonctionnellement
- `admin.html` : restriction et controle d'acces

### Résultat
- Base Firestore non exposée publiquement 
- Fonctionnement applicatif inchangé
- Compatible environnement de production
- Restriction et controles supplémentaire contre la fuite ou la modification des donnees

# Logique applicative #
Navigateur
   │
   ├─ Firebase Auth (remplacement localStorage)
   │       │
   │       └─ UID Firebase
   │
   ├─ Firestore (sécurisé)
   │
   └─ localStorage
           └─ données métier uniquement
