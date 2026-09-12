# Handoff — Reprendre le projet

> Lire ce fichier en premier si tu rejoins le projet ou reprends après une longue pause.

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
# Remplir les valeurs (DB, Redis, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MinIO, LiveKit, etc.)

# 2. Lancer l'infra
docker compose up -d

# 3. Migrations DB
cd backend && pnpm db:migrate

# 4. Frontend
cd frontend && pnpm dev

# 5. Backend
cd backend && pnpm dev
```

## Où trouver quoi

| Question | Fichier |
|----------|---------|
| Stack & vision | `claude.md` |
| Décisions prises | `MEMORY.md` |
| Structure dossiers | `STRUCTURE.md` |
| Fonctionnalités prévues | `docs/PRD.md` |
| Pourquoi ces choix archi | `docs/ADR.md` |
| Comment coder (règles) | `.cursor/rules/` |
| Patterns Drizzle | `.claude/skills/drizzle.md` |
| Patterns TanStack | `.claude/skills/tanstack.md` |
| Créer une feature | `.claude/commands/new-feature.md` |
| Créer une entité | `.claude/commands/new-entity.md` |
| Créer un endpoint | `.claude/commands/new-endpoint.md` |
| Audit de l'état réel du projet | `docs/BILAN.md` |

## État actuel du projet

> Mettre à jour à chaque handoff

- **Phase** : Développement actif — très au-delà du MVP initial
- **Dernier travail** : 27 modules backend complets, schéma Drizzle (29 tables), auth JWT/RBAC, FSD frontend (18 entités), signature électronique, PDF, chat + visio LiveKit
- **Prochaine tâche** : voir `docs/BILAN.md` — priorité aux décisions sur l'offline-first, Mobile Money, et l'ajout de tests automatisés (aucun test n'existe actuellement)

## Contexte métier important

- Multi-tenant via `sub_school_id` — **toujours** filtrer par ce champ en DB (déjà en place dans les services)
- Offline-first — **décidé (ADR-003) mais pas encore implémenté** : les mutations passent directement par l'API, pas de sync queue pour l'instant
- RBAC strict — ne jamais bypass les rôles côté backend (déjà en place)
- Mobile Money — **décidé comme priorité (PRD) mais pas encore intégré** : le module `payments` est un CRUD simple sans provider pour l'instant

## Contacts & ressources

- Marché cible : RDC (Kinshasa, Lubumbashi, Goma)
- Concurrents analysés : Prométhée, PRONOTE, GEPI
- Africa's Talking (SMS) : https://africastalking.com
- Drizzle docs : https://orm.drizzle.team
- TanStack docs : https://tanstack.com
