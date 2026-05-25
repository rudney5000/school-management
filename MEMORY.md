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

## Ce qui N'est PAS encore fait

- [ ] Schéma Drizzle complet
- [ ] Setup monorepo pnpm
- [ ] Auth JWT multi-rôle
- [ ] Tables manquantes : report_card, document, message, sync_log
- [ ] Intégration Mobile Money
- [ ] Mode offline sync queue

## Sessions récentes

<!-- Ajouter ici après chaque session -->
<!-- Format : ### [DATE] — Ce qui a été fait / décidé -->
