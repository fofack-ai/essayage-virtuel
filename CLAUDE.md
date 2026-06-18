# CLAUDE.md

Ce fichier fournit des conseils à Claude Code (claude.ai/code) lorsqu'il travaille avec du code dans ce référentiel.

## Aperçu du référentiel
Ce référentiel contient une application complète d'essayage virtuel de vêtements avec :
- **Frontend** : Application React (Create React App) dans le répertoire `frontend/`
- **Backend** : API Node.js/Express avec base de données MySQL dans le répertoire `backend/`
Le frontend communique avec le backend via des points de terminaison API RESTful.

## Informations clés
- **Emplacement du frontend** : répertoire `frontend/`
- **Emplacement du backend** : répertoire `backend/`
- **Pile technologique :**
  - Frontend : React (Create React App), Tailwind CSS, React Router, React Context API
  - Backend : Node.js, Express, MySQL, authentification JWT
- **Fonctionnalités principales** : Navigation produits, panier d'achat, authentification, expérience d'essayage virtuel, tableau de bord administrateur

## Commandes de développement

### Développement frontend (dans frontend/)
- `npm start` - Exécute l'application en mode développement à http://localhost:3000
- `npm test` - Lance l'exécuteur de tests en mode veille interactive
- `npm test -- --watchAll=false` - Exécute les tests une fois et quitte
- `npm test -- --coverage` - Exécute les tests avec rapport de couverture
- `npm run build` - Construit l'application pour la production dans le dossier `build`
- `npm run eject` - **Attention** : Opération irréversible qui supporte la dépendance de construction unique

### Développement backend (dans backend/)
- `npm install` - Installer les dépendances
- `npm start` - Démarrer le serveur de production (node src/server.js)
- `npm run dev` - Démarrer le serveur de développement avec nodemon (nodemon src/server.js)
- Configuration de la base de données : Exécuter les scripts SQL dans le répertoire `/sql/` dans l'ordre :
  1. `01_create_tables.sql`
  2. `02_create_indexes.sql`
  3. `03_seed_data.sql`

### Variables d'environnement

#### Frontend (`frontend/.env`)
- `REACT_APP_API_URL` - URL de base pour l'API backend (par défaut : 'http://localhost:5000/api')

#### Backend (`backend/.env` - copier depuis `.env.example`)
- `PORT` - Port du serveur (défaut : 5000)
- `DB_HOST` - Hôte MySQL (défaut : localhost)
- `DB_USER` - Nom d'utilisateur MySQL
- `DB_PASSWORD` - Mot de passe MySQL
- `DB_NAME` - Nom de la base de données MySQL
- `JWT_SECRET` - Clé secrète pour la signature des tokens JWT
- `JWT_EXPIRES_IN` - Durée d'expiration du token JWT (ex: '7d')
- `NODE_ENV` - Environnement (développement/production)

## Architecture & Structure du code

### Structure frontend
Le frontend suit une structure standard Create React App avec une organisation par domaine :
- `frontend/src/components/` - Composants UI réutilisables (layout, shop, tryon)
- `frontend/src/context/` - Fournisseurs de React Context (CartContext, AuthContext)
- `frontend/src/pages/` - Composants de page mappés aux routes
- `frontend/src/services/` - Services API et données mock (api.js, productService.js, authService.js)
- `frontend/src/App.js` - Composant principal de l'application avec routage
- `frontend/src/index.js` - Point d'entrée de l'application

### Structure backend
Le backend suit une architecture en couches type MVC :
- `backend/src/app.js` - Configuration de l'application Express et mise en place du middleware
- `backend/src/server.js` - Point d'entrée du serveur
- `backend/src/config/` - Fichiers de configuration (database, cors, environment)
- `backend/src/controllers/v1/` - Gestionnaires de requêtes (authController.js, userController.js, etc.)
- `backend/src/models/v1/` - Modèles de données et requêtes (userModel.js, productModel.js, etc.)
- `backend/src/services/v1/` - Couche de logique métier (authService.js, productService.js, etc.)
- `backend/src/routes/v1/` - Définitions des routes (auth.js, users.js, products.js, etc.)
- `backend/src/middleware/` - Middleware personnalisé (auth.js, admin.js, upload.js, validation.js, errorHandler.js)
- `backend/src/utils/` - Fonctions utilitaires (jwt.js, crypto.js, helpers.js, constants.js)
- `backend/sql/` - Fichiers de schéma et de peuplement de la base de données
- `backend/uploads/` - Stockage des fichiers uploadés (products, users, tryons)

### Modèles architecturaux clés

#### Gestion d'état frontend
- Utilise l'API React Context pour l'état global (`CartContext` et `AuthContext`)
- `CartContext` gère les éléments du panier et fournit des fonctions (addItem, removeItem, updateQty, clearCart)
- `AuthContext` gère l'état d'authentification (utilisateur, login, logout, etc.)
- Consommé via des hooks personnalisés (`useCart()`, `useAuth()`) dans les composants
- L'état UI local géré avec `useState` (entrées de formulaire, bascules)

#### Architecture backend
- Séparation des préoccupations : Contrôleurs → Services → Modèles
- Les contrôleurs gèrent les requêtes/réponses HTTP et la validation
- Les services contiennent la logique métier
- Les modèles gèrent les interactions avec la base de données
- Middleware pour les préoccupations transversales (authentification, validation, gestion des erreurs)
- Conception d'API RESTful avec routage versionné (/api/v1/*)

#### Flux de données (Frontend vers Backend)
- Les services frontend (`src/services/`) effectuent des requêtes HTTP vers l'API backend
- Les contrôleurs backend valident l'entrée et appellent les services
- Les services exécutent la logique métier et interagissent avec les modèles
- Les modèles effectuent les opérations de base de données en utilisant MySQL2
- Les réponse sont formatées et renvoyées au frontend

#### Fonctionnalité d'essayage virtuel (Fonctionnalité centrale)
- **Frontend** : Implémenté dans `frontend/src/pages/tryon/TryOn.jsx`
  - Flux de travail en plusieurs étapes : téléchargement de photo → analyse → résultats
  - Intégré avec le système de panier pour ajouter les articles essayés
  - Fonctionnalités : téléchargement de photo (glisser-déposer/webcam), superposition simulée de vêtements, recommandations de tailles, scoring de compatibilité IA, mesures ajustables
- **Backend** :
  - `tryonController.js` gère les points de terminaison liés aux essayages
  - `tryonService.js` contient la logique métier
  - `tryonModel.js` gère les opérations de base de données pour la table tryons
  - Les uploads de fichiers sont gérés via le middleware multer

## Fichiers importants à comprendre en premier

### Frontend
1. `frontend/src/App.js` - Disposition principale de l'application et routage
2. `frontend/src/context/CartContext.jsx` - Gestion globale de l'état du panier
3. `frontend/src/context/AuthContext.jsx` - Gestion de l'état d'authentification
4. `frontend/src/index.js` - Point d'entrée de l'application
5. `frontend/src/services/productService.js` - Données produits mock et helpers
6. `frontend/src/services/authService.js` - Helpers du service d'authentification
7. `frontend/src/pages/tryon/TryOn.jsx` - Page d'essayage virtuel (fonctionnalité centrale)
8. `frontend/tailwind.config.js` - Configuration du stylisme et extension du thème
9. `frontend/package.json` - Dépendances et scripts disponibles

### Backend
1. `backend/src/server.js` - Point d'entrée de l'application
2. `backend/src/app.js` - Configuration de l'application Express
3. `backend/src/routes/v1/index.js` - Routeur API principal (agrége toutes les routes v1)
4. `backend/src/controllers/v1/authController.js` - Gestionnaire des points de terminaison d'authentification
5. `backend/src/models/v1/userModel.js` - Modèle de données utilisateur
6. `backend/src/services/v1/authService.js` - Logique métier d'authentification
7. `backend/src/middleware/auth.js` - Middleware d'authentification
8. `backend/src/config/database.js` - Configuration de la connexion à la base de données
9. `backend/sql/01_create_tables.sql` - Définition du schéma de la base de données
10. `backend/package.json` - Dépendances et scripts disponibles

## Directives de développement

### Ajout de nouvelles fonctionnalités (Frontend)
- **Nouvelles pages** : Créer un composant dans `frontend/src/pages/` et ajouter une route dans `frontend/src/App.js`
- **Composants partagés** : Créer dans `frontend/src/components/` avec le sous-domaine approprié (layout, shop, tryon, etc.)
- **État global** : Étendre les Contexts existants (`CartContext`, `AuthContext`) ou créer un nouveau contexte dans `frontend/src/context/`
- **Récupération de données** : Étendre `frontend/src/services/api.js` ou créer de nouveaux fichiers de service
- **Stylisme** : Utiliser les classes utilitaires Tailwind ou étendre `frontend/tailwind.config.js` si nécessaire
- **Fonctionnalités d'essayage virtuel** : Suivre les modèles dans `frontend/src/pages/tryon/TryOn.jsx`
- **Fonctionnalités d'authentification** : Suivre les modèles dans `frontend/src/pages/auth/Auth.jsx` et `frontend/src/services/authService.js`

### Ajout de nouvelles fonctionnalités (Backend)
- **Nouveaux points de terminaison** :
  1. Ajouter une route dans `backend/src/routes/v1/[resource].js`
  2. Ajouter un contrôleur dans `backend/src/controllers/v1/[resource]Controller.js`
  3. Ajouter un service dans `backend/src/services/v1/[resource]Service.js`
  4. Ajouter un modèle dans `backend/src/models/v1/[resource]Model.js`
  5. Enregistrer la route dans `backend/src/routes/v1/index.js`
- **Modifications de la base de données** :
  1. Modifier le SQL dans `backend/sql/01_create_tables.sql`
  2. Créer un script de migration si la table existe déjà
  3. Mettre à jour les méthodes correspondantes du modèle
- **Middleware** : Ajouter dans `backend/src/middleware/` et enregistrer dans `backend/src/app.js`
- **Utilitaires** : Ajouter dans `backend/src/utils/` si nécessaire
- **Uploads de fichiers** : Utiliser le middleware d'upload existant dans `backend/src/middleware/upload.js`

### Tests
- **Frontend** :
  - Les tests se trouvent à côté des fichiers source avec le suffixe `.test.js`
  - Utilise Jest et React Testing Library
  - Rendu des composants avec `render()` de `@testing-library/react`
  - Interrogation du DOM avec l'objet `screen`
  - Utilisation de `@testing-library/jest-dom` pour les matchers personnalisés
- **Backend** :
  - Actuellement aucune suite de tests établie (envisager d'ajouter des tests Jest ou Mocha/Chai)
  - Tester les points de terminaison API avec des outils comme Postman ou curl
  - Tester les interactions avec la base de données avec le client MySQL

### Conventions de stylisme (Frontend)
- Appliquer directement les classes Tailwind en JSX pour le stylisme utilitaire
- Utiliser l'attribut `className` pour les classes Tailwind
- Pour les styles dynamiques complexes, utiliser l'objet JavaScript `style`
- Suivre la palette de couleurs existente de `tailwind.config.js` (ink, cream, warm, gold, rust, muted)
- Utiliser les familles de polices existantes : serif pour les titres (Cormorant Garamond), sans pour le corps du texte (DM Sans)
- Maintenir des valeurs cohérentes d'espacement et de bordure arrondie comme utilisées dans tout le codebase

## Référence rapide
- **Démarrer le développement full-stack :**
  1. Backend : `cd backend && npm run dev` (démarre sur http://localhost:5000)
  2. Frontend : `cd frontend && npm start` (démarre sur http://localhost:3000)
- **Exécuter les tests frontend** : `cd frontend && npm test`
- **Construire le frontend pour la production** : `cd frontend && npm run build`
- **Arrêter les serveurs** : Ctrl+C dans chaque terminal