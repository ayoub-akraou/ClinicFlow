# ClinicFlow backend

Backend REST de ClinicFlow, basé sur l'ERD du projet : `users`, `patients` et `appointments`. Les noms des champs SQL restent en `snake_case` et les relations sont celles du diagramme.

## Prérequis

- Node.js et npm
- PostgreSQL démarré, avec une base vide nommée `clinicflow`

Si la base n'existe pas encore, crée-la dans pgAdmin ou avec le compte PostgreSQL qui t'a été configuré :

```bash
psql -U postgres -h localhost -c "CREATE DATABASE clinicflow;"
```

## Installation

Dans le dossier `backend` :

```bash
npm install
cp .env.example .env
```

Ouvre `.env` et remplace `your_password` par le mot de passe de ton utilisateur PostgreSQL. Remplace aussi `JWT_SECRET` par une chaîne privée aléatoire d'au moins 32 caractères. Ne partage pas le contenu de `.env`.

## Préparer la base

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Les données de démonstration créent un administrateur (`admin@clinicflow.local`) et deux comptes staff (`staff1@clinicflow.local`, `staff2@clinicflow.local`). Leur mot de passe est `ClinicFlow123!`. Ce sont des identifiants locaux de démonstration : change-les avant toute utilisation réelle.

## Démarrer l'API

```bash
npm run dev
```

L'API écoute sur `http://localhost:3000`. `GET /api/health` permet de vérifier que le serveur répond.

## Routes

Toutes les routes sauf `GET /api/health` et `POST /api/auth/login` nécessitent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Fonction |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Connexion et obtention d'un JWT |
| `GET` | `/api/auth/me` | Utilisateur connecté |
| `GET` | `/api/patients` | Liste paginée, recherche `?search=` |
| `POST` | `/api/patients` | Créer un patient |
| `GET` | `/api/patients/:id` | Détails du patient et rendez-vous |
| `PATCH` | `/api/patients/:id` | Modifier un patient |
| `DELETE` | `/api/patients/:id` | Supprimer un patient (admin uniquement) |
| `GET` | `/api/appointments` | Liste, filtres `?date=YYYY-MM-DD&status=pending` |
| `POST` | `/api/appointments` | Créer un rendez-vous |
| `PATCH` | `/api/appointments/:id/status` | Modifier le statut |
| `GET` | `/api/dashboard` | Statistiques du tableau de bord |

La suppression d'un patient supprime aussi ses rendez-vous (cascade conforme à la relation de l'ERD). Les comptes utilisateurs ne sont pas supprimés par cascade afin de préserver les références `created_by`.
