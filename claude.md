# School Management — Contexte IA

> Lu à chaque prompt. Rester court et précis.

## Projet
Plateforme SaaS de gestion scolaire pour le marché congolais/africain.
Multi-école, offline-first, mobile-first, multi-devises (CDF/USD/XAF).

## Stack
- **Frontend** : React 19 + TypeScript + Vite · TanStack Router + Query · RTK · Tailwind v4 + shadcn/ui
- **Backend** : Node.js + Express + TypeScript · Drizzle ORM · PostgreSQL · Redis · Socket.IO · LiveKit (visio) · MinIO (stockage)
- **Infra** : Docker Compose · pnpm · Devcontainer (`.devcontainer/`)

## État réel du projet (au 2026-09-12)
> MEMORY.md liste encore certains points comme "non faits" alors qu'ils sont déjà en place — se fier à cette section en cas de doute avant de redémarrer une feature déjà existante.
- ✅ Déjà fait : schéma Drizzle complet (29 tables), auth JWT + RBAC (6 rôles), 27 modules backend (router/controller/service/schema), FSD frontend stricte, signature électronique de documents, génération PDF (bulletins/certificats/contrats), chat temps réel + visio LiveKit.
- ❌ Pas encore fait (malgré le PRD/ADR) : mode offline-first (IndexedDB + sync queue — ADR-003), intégration Mobile Money, module `notifications`/SMS (Africa's Talking — ADR-005), i18n swahili, tests automatisés (aucun script `test` ni framework installé côté backend ou frontend).
- Bilan complet et détaillé : @docs/BILAN.md

## Structure
@STRUCTURE.md

## Mémoire & décisions
@MEMORY.md

## Règles de code
@.cursor/rules/code.mdc

## PRD
@docs/PRD.md

## ADR (décisions d'architecture)
@docs/ADR.md

## Vocabulaire du domaine (CONTEXT.md — concept Matt Pocock)
@CONTEXT.md

## Skills Matt Pocock
- Avant chaque feature : @.claude/skills/matt-pocock/grill-with-docs.md
- Pour coder avec tests : @.claude/skills/matt-pocock/tdd.md
- Pour debugger : @.claude/skills/matt-pocock/diagnose.md

## Cowork / Claude
- Plugin activé : **Engineering** (standup, code-review, architecture, incident-response, tech-debt...).
- Avant de proposer une nouvelle feature ou de rouvrir un chantier listé "non fait" ci-dessus, vérifier l'état réel dans `docs/BILAN.md` plutôt que de se fier uniquement à `MEMORY.md`.
