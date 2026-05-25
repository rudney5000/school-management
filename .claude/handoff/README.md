# Handoff — Reprendre le projet

> Lire ce fichier en premier si tu rejoins le projet ou reprends après une longue pause.

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
# Remplir les valeurs (DB, Redis, JWT_SECRET, etc.)

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
| Créer un endpoint | `.claude/commands/new-endpoint.md` |

## État actuel du projet

> Mettre à jour à chaque handoff

- **Phase** : Setup initial
- **Dernier travail** : Plan d'architecture défini
- **Prochaine tâche** : Setup monorepo pnpm + Docker Compose + schéma Drizzle

## Contexte métier important

- Multi-tenant via `sub_school_id` — **toujours** filtrer par ce champ en DB
- Offline-first — les mutations critiques passent par la sync queue avant l'API
- RBAC strict — ne jamais bypass les rôles côté backend
- Mobile Money prioritaire — les paiements en carte ne sont pas la priorité

## Contacts & ressources

- Marché cible : RDC (Kinshasa, Lubumbashi, Goma)
- Concurrents analysés : Prométhée, PRONOTE, GEPI
- Africa's Talking (SMS) : https://africastalking.com
- Drizzle docs : https://orm.drizzle.team
- TanStack docs : https://tanstack.com
