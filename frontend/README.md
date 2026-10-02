# ClinicFlow frontend

Interface React pour consulter les statistiques de la clinique, rechercher et gérer les patients, et organiser leurs rendez-vous.

## Prérequis

- Node.js 20.19 ou plus récent (ou 22.12 ou plus récent)
- Le backend ClinicFlow démarré sur `http://localhost:3000`
- PostgreSQL configuré et le jeu de données de démonstration installé (voir `../backend/README.md`)

## Installation et démarrage

Depuis ce dossier (`frontend`) :

```bash
npm install
npm run dev
```

Ouvre ensuite l’adresse affichée par Vite, normalement `http://localhost:5173`.
En développement, Vite transmet les appels `/api` au backend sur `http://localhost:3000`.

Les comptes de démonstration et leur mot de passe sont indiqués dans le README du backend.

## Vérifications

```bash
npm run build
```

## Pages principales

- `/connexion` : connexion et session JWT
- `/inscription` : création d’un compte staff
- `/` : statistiques de la clinique
- `/patients` : recherche, pagination, création, modification et suppression admin
- `/patients/:id` : dossier et rendez-vous du patient
- `/rendez-vous` : création, filtres et changement de statut
