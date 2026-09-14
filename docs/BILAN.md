# Bilan du projet — School Management Africa

*Analysé à partir du dossier `school-management` (backend, frontend, docs, ADR, CI).*

## Vision du produit

Une plateforme SaaS de gestion scolaire pensée pour le marché congolais/africain : multi-école, offline-first, mobile-first, multi-devises (CDF/USD/XAF), avec paiement par Mobile Money plutôt que carte bancaire. Le PRD est clair et réaliste : personas bien définis (admin, enseignant, parent), priorisation P1/P2/P3 cohérente, modèle économique chiffré (25–60 USD/mois), KPIs concrets (dashboard < 3s en 3G, 100% offline sur les features critiques).

## Stack technique

- **Frontend** : React 19 (RC) + TypeScript + Vite, TanStack Router/Query, Redux Toolkit, Tailwind v4 + shadcn/ui, architecture **Feature-Sliced Design** stricte (pages → features → entities → shared).
- **Backend** : Node/Express + TypeScript, Drizzle ORM + PostgreSQL, Redis, Socket.IO, LiveKit (visio), MinIO (stockage fichiers).
- **Infra** : Docker Compose (Postgres, Redis, MinIO, LiveKit), monorepo pnpm avec workspace `packages/pdf-templates` partagé.

## État d'avancement réel — bien plus avancé que ce que dit la documentation

C'est le point le plus frappant : **`MEMORY.md` est largement obsolète**. Il liste encore comme "non fait" le schéma Drizzle, le setup monorepo, l'auth JWT multi-rôle — alors qu'en réalité :

- Le schéma Drizzle compte **29 tables** couvrant tout le domaine métier (school, sub-school, users, students, teachers, parents, classes, courses, exams, grades, attendances, payments, reports, chat, live-sessions, signatures de documents, certificats...).
- L'auth JWT + RBAC (6 rôles) est implémentée (`authenticate.ts`, `authorize.ts`, `restrict-to-own-child.ts`).
- **27 modules backend** complets (router/controller/service/schema Zod) sont en place — bien au-delà du MVP décrit dans le PRD : signature électronique de documents, génération de PDF (bulletins, certificats, contrats), chat temps réel avec pièces jointes, visioconférence LiveKit, présences enseignants/élèves séparées.
- Le frontend suit la FSD à la lettre : ~18 entités, ~16 features, ~16 pages, chacune avec ses hooks TanStack Query dédiés (create/update/delete/list) — un niveau de systématisation rare à ce stade.

Autrement dit, le projet a largement dépassé son propre carnet de bord. Le rituel "mettre à jour MEMORY.md après chaque session" annoncé dans le fichier lui-même n'a pas été suivi — la section "Sessions récentes" est restée vide alors que manifestement de nombreuses sessions de travail conséquentes ont eu lieu.

## Écarts entre la doc et le code (à corriger ou assumer)

- **Mode offline-first (ADR-003)** : décidé et documenté comme critique pour la RDC, mais **rien n'est implémenté** côté code — pas de `features/offline-sync`, pas de dépendance IndexedDB/`persistQueryClient`, pas de table `sync_log`. C'est pourtant un pilier du positionnement produit ("fiable même sans internet").
- **Mobile Money** : présenté comme la priorité de paiement n°1 (vs carte bancaire), mais le module `payments` reste un CRUD simple sans intégration Airtel/M-Pesa/Orange.
- **Notifications SMS (ADR-005, Africa's Talking)** : le module `notifications` annoncé dans `STRUCTURE.md` et même listé dans `backend/README.md` **n'existe pas** dans `src/modules` — le README documente un module fantôme.
- **i18n** : `CONTEXT.md`/PRD prévoient français + lingala + swahili. Le code a bien fr/ln, plus en/ru (russe — cohérent si l'équipe teste aussi depuis Moscou), mais **le swahili annoncé est absent**.
- Deux fichiers de lock pnpm coexistent à la racine (`pnpm-lock.yaml` et un résidu `pnpm-lock.yaml.4281548114` de taille quasi identique) — probable reste de merge/conflit, à nettoyer pour éviter toute confusion sur les versions verrouillées.

## Point de vigilance qui casse la CI

Le pipeline `.github/workflows/ci.yml` exécute `pnpm --filter backend test` dans le job `test-backend` — **mais aucun script `test` n'existe dans `backend/package.json`**, et aucune dépendance de test (vitest/jest/supertest...) n'est installée nulle part dans le repo. Concrètement : soit ce job échoue systématiquement, soit il n'a jamais été déclenché sérieusement. Il n'y a par ailleurs aucun test automatisé identifiable (unitaire ou e2e) sur l'ensemble du projet, backend comme frontend — un vrai risque vu le volume de logique métier déjà écrit (calcul de moyennes, RBAC, multi-tenant par `sub_school_id`, signatures de documents).

## Autres points d'attention techniques

- **React 19.0.0-rc.1** en dépendance frontend : une release candidate, pas une version stable, avec en plus `@types/react` resté en `^18.x` — décalage de types qui peut provoquer des faux positifs/négatifs TypeScript.
- **Isolation multi-tenant** (`sub_school_id`, ADR-004) : la décision est saine, mais elle repose sur la discipline de chaque requête Drizzle à bien filtrer — sans RLS PostgreSQL activée (mentionnée comme filet de sécurité additionnel dans l'ADR mais apparemment pas mise en place), une seule requête oubliée peut faire fuiter des données entre écoles. À auditer module par module.
- Le dossier `Arch/` contient une modélisation C4 (Structurizr DSL) à jour — bon réflexe pour documenter l'architecture indépendamment du code.

## Points forts à souligner

- Vision produit cohérente et bien ancrée dans le contexte local (Mobile Money, connexions instables, multi-devises, trimestres congolais plutôt que semestres).
- Discipline d'architecture réelle et respectée (FSD stricte, séparation router/controller/service/schema sur 27 modules sans exception).
- Fonctionnalités avancées déjà livrées bien au-delà d'un MVP : signature électronique, génération PDF multi-templates, chat + visio intégrés.
- Bonne base de gouvernance : ADR détaillés, CODEOWNERS, CI avec lint/typecheck/format déjà opérationnels.

## Recommandations prioritaires

1. **Remettre `MEMORY.md` à jour immédiatement** pour refléter l'état réel — sinon toute reprise du projet (par vous ou une IA) repartira sur des bases fausses.
2. **Décider du sort du mode offline et de Mobile Money** : soit les implémenter (ce sont des promesses fortes du PRD), soit les repousser explicitement en P2/P3 dans la doc pour ne plus créer d'attentes non tenues.
3. **Ajouter des tests backend a minima** (au moins sur `auth`, le calcul des moyennes/bulletins, et l'isolation `sub_school_id`) pour que le job CI `test-backend` cesse d'être un mensonge silencieux.
4. **Nettoyer le module `notifications` fantôme** — soit le créer, soit retirer sa mention de `STRUCTURE.md`/`README.md`.
5. **Geler React sur une version stable** (18.x ou 19 stable dès sa sortie) et aligner `@types/react` en conséquence.
6. Supprimer le fichier de lock résiduel et vérifier qu'un seul `pnpm-lock.yaml` fait foi.
