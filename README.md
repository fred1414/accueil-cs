# Version 1.1 
## Date: 19-12-2025

### Sécurité globale
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
- `cloud-storage.js` : legers changements; faiuble impacts
- `admin.html` : restriction et controle d'acces

### Résultat
- Base Firestore non exposée publiquement 
- Fonctionnement applicatif inchangé
- Compatible environnement de production
- Restriction et controles supplémentaire contre la fuite ou la modification des donnees

# Architecture #
```text
Navigateur
   │
   ├─ Firebase Auth (identité technique)
   │       │
   │       └─ UID Firebase
   │
   ├─ Firestore (base sécurisée)
   │
   └─ localStorage
           └─ données métier uniquement
