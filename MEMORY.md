# MEMORY — Décisions & contexte persistant

> Mettre à jour après chaque session de travail significative.
> Format : date · décision · raison.

---

## Architecture

| Date | Décision | Raison |
|------|----------|--------|
| 2025-01 | Drizzle ORM choisi sur Prisma | Perf, type-safety native SQL, meilleur pour connexions lentes |
| 2025-01 | TanStack Query + IndexedDB pour offline | Sync queue RTK + persistance locale critique pour RDC |
| 2025-01 | Hébergement Hetzner (ZA) ou VPS local | Latence réduite vs Europe |
| 2025-01 | Mobile Money (Airtel, M-Pesa, Orange) prioritaire | Pas de carte bancaire dans le marché cible |

## Conventions établies

- Langue du code : **anglais** (variables, fonctions, commentaires)
- Langue UI : **français** (par défaut), i18n prévu (Lingala, Swahili)
- Nommage DB : `snake_case`
- Nommage TS : `camelCase` variables, `PascalCase` types/classes
- Branches git : `feat/`, `fix/`, `chore/`, `refactor/`

## Rôles utilisateurs (RBAC)

```
super_admin → admin_school → director → teacher → parent → student
```

## Ce qui est fait (mis à jour 2026-09-12)

- [x] Schéma Drizzle complet (29 tables)
- [x] Setup monorepo pnpm
- [x] Auth JWT multi-rôle (RBAC, 6 rôles)
- [x] 27 modules backend (router/controller/service/schema Zod)
- [x] Signature électronique de documents + génération PDF (bulletins, certificats, contrats)
- [x] Chat temps réel (Socket.IO) + visioconférence (LiveKit)

## Ce qui N'est PAS encore fait

- [ ] Mode offline sync queue (IndexedDB) — ADR-003 non implémenté (pas de feature `offline-sync`, pas de dépendance IndexedDB)
- [ ] Intégration Mobile Money (Airtel/M-Pesa/Orange) — module `payments` reste un CRUD simple
- [ ] Module notifications / SMS (Africa's Talking, ADR-005) — absent de `backend/src/modules` malgré sa mention dans STRUCTURE.md et backend/README.md
- [ ] i18n Swahili (fr/en/ru/ln déjà présents)
- [ ] Tests automatisés — aucun script `test` ni framework installé, backend comme frontend (le job CI `test-backend` est vert mais ne teste rien)
- [ ] Table `sync_log` (liée à l'offline queue, non créée)

## Sessions récentes

<!-- Ajouter ici après chaque session -->
<!-- Format : ### [DATE] — Ce qui a été fait / décidé -->

### 2026-09-12 — Audit complet du projet (via Claude/Cowork)
Constat : le projet était bien plus avancé que ce fichier ne le laissait penser (schéma, auth, 27 modules déjà faits) — ce fichier n'avait pas été mis à jour depuis le démarrage. Correction de ce fichier + `claude.md` + `STRUCTURE.md` + `.claude/handoff/README.md` + `.claude/commands/new-endpoint.md` pour refléter l'état réel. Bilan détaillé : `docs/BILAN.md`. Gaps confirmés à trancher : offline-first, Mobile Money, notifications SMS, tests automatisés.
