Version 1.1:
Changes majeurs: sécurité
- /admin : restreint si non admin ou pas authentifié - redirection sur l'index
- regles Firebase configurées pour filtrer les accès en base
- gestion des droits admin/utilisateur via Firebase 
- application qui charge les données depuis Firebase et plus le localStorage

== Logique applicative ==
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
