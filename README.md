# ClinicFlow

ClinicFlow est une application web de gestion de clinique. Elle permet au personnel de gérer les patients et leurs rendez-vous, et de consulter les statistiques principales. Le projet comprend une API REST Node.js/Express, une base PostgreSQL gérée avec Prisma et une interface React.

## Fonctionnalités

- Inscription et connexion avec une session JWT
- Tableau de bord avec les statistiques de la clinique
- Recherche, consultation et modification des dossiers patients
- Création de rendez-vous et mise à jour de leur statut
- Suppression des patients réservée au rôle administrateur

## Prérequis

- Node.js 20.19 ou plus récent (ou 22.12 ou plus récent) et npm
- PostgreSQL installé et démarré
- Git, pour récupérer le projet

## Installation

### 1. Installer les dépendances du backend

Depuis le dossier `backend` :

```bash
npm install
```

### 2. Configurer PostgreSQL et le backend

Crée une base de données vide nommée `clinicflow` avec pgAdmin ou avec `psql` :

```bash
psql -U postgres -h localhost -c "CREATE DATABASE clinicflow;"
```

Copie `backend/.env.example` vers `backend/.env`, puis adapte les valeurs à ta configuration PostgreSQL :

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/clinicflow?schema=public"
JWT_SECRET="replace-this-with-a-random-secret-at-least-32-characters"
PORT=3000
CLIENT_ORIGIN="http://localhost:5173"
```

Remplace `your_password` par le mot de passe de ton utilisateur PostgreSQL. Remplace aussi `JWT_SECRET` par une valeur aléatoire privée d’au moins 32 caractères. Ne partage pas et ne commite pas le fichier `.env`.

### 3. Préparer la base de données

Dans `backend` :

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Le seed crée des comptes de démonstration :

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@clinicflow.local` | `ClinicFlow123!` |
| Staff | `staff1@clinicflow.local` | `ClinicFlow123!` |
| Staff | `staff2@clinicflow.local` | `ClinicFlow123!` |

Ces comptes servent uniquement au développement local.

### 4. Installer les dépendances du frontend

Dans un autre terminal, depuis le dossier `frontend` :

```bash
npm install
```

## Démarrer l’application

Lance le backend et le frontend dans deux terminaux séparés.

Dans `backend` :

```bash
npm run dev
```

Dans `frontend` :

```bash
npm run dev
```

Ouvre l’adresse affichée par Vite, normalement <http://localhost:5173>. Le backend écoute normalement sur <http://localhost:3000>. En développement, les requêtes `/api` du frontend sont transmises au backend.

Pour vérifier que l’API répond, ouvre <http://localhost:3000/api/health>.

## Pages de l’application

- `/connexion` : connexion
- `/inscription` : création d’un compte staff
- `/` : tableau de bord
- `/patients` : recherche et gestion des patients
- `/patients/:id` : dossier détaillé d’un patient
- `/rendez-vous` : gestion des rendez-vous

## API

Toutes les routes ci-dessous, sauf `GET /api/health`, `POST /api/auth/login` et `POST /api/auth/register`, nécessitent un jeton JWT dans l’en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Vérifier que l’API répond |
| `POST` | `/api/auth/login` | Se connecter et obtenir un jeton |
| `POST` | `/api/auth/register` | Créer un compte staff |
| `GET` | `/api/auth/me` | Lire le compte connecté |
| `GET` | `/api/dashboard` | Obtenir les statistiques |
| `GET` | `/api/patients` | Lister et rechercher les patients (`?search=`) |
| `POST` | `/api/patients` | Créer un patient |
| `GET` | `/api/patients/:id` | Lire un dossier patient et ses rendez-vous |
| `PATCH` | `/api/patients/:id` | Modifier un patient |
| `DELETE` | `/api/patients/:id` | Supprimer un patient (administrateur uniquement) |
| `GET` | `/api/appointments` | Lister et filtrer les rendez-vous |
| `POST` | `/api/appointments` | Créer un rendez-vous |
| `PATCH` | `/api/appointments/:id/status` | Modifier le statut d’un rendez-vous |

L’inscription publique crée toujours un compte `staff`. Le client ne peut pas choisir le rôle.

## Vérifier le frontend

Depuis `frontend` :

```bash
npm run build
```

## Structure du projet

```text
ClinicFlow/
├── backend/    # API Express, Prisma et accès PostgreSQL
├── frontend/   # Application React et Vite
└── README.md   # Guide du projet
```