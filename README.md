Version 1.1:
Changes majeurs: sécurité
# CHANGELOG — Sécurisation Firebase

## [2025-19-12]

### Sécurité
- Suppression de l’accès public à Firestore
- Activation de l’authentification Firebase anonyme
- Accès Firestore conditionné à `request.auth != null`

### Authentification
- Ajout d’une connexion Firebase anonyme automatique
- Initialisation Firebase côté pages HTML
- Aucun compte Firebase utilisateur créé
- Aucun impact sur l’authentification métier existante

### Stockage
- Synchronisation Firestore → localStorage conservée
- Synchronisation localStorage → Firestore conservée
- Chargement initial des données depuis Firestore sans login préalable

### Code
- Aucun usage de `type="module"`
- Aucun `export` ajouté
- Aucune modification du modèle de données
- Aucune modification des rôles métier (admin / agent)

### Pages impactées
- `login.html` : ajout de l’authentification Firebase anonyme
- `cloud-storage.js` : inchangé fonctionnellement

### Résultat
- Base Firestore non exposée publiquement
- Fonctionnement applicatif inchangé
- Compatible environnement de production

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
