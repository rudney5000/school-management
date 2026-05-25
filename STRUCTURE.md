# STRUCTURE — Arborescence du projet

```
school-management/
├── claude.md                   ← Contexte IA principal (lu à chaque prompt)
├── MEMORY.md                   ← Décisions & mémoire persistante
├── STRUCTURE.md                ← Ce fichier
├── docker-compose.yml          ← PostgreSQL + Redis + App
├── docker-compose.prod.yml
├── .env.example
│
├── docs/
│   ├── PRD.md                  ← Product Requirements Document
│   └── ADR.md                  ← Architecture Decision Records
│
├── .cursor/
│   └── rules/
│       ├── code.mdc            ← Règles globales de code
│       ├── frontend.mdc        ← Règles spécifiques React/TS
│       └── backend.mdc         ← Règles spécifiques Express/Drizzle
│
├── .claude/
│   ├── skills/
│   │   ├── drizzle.md          ← Comment écrire des schémas Drizzle
│   │   ├── tanstack.md         ← Patterns TanStack Query/Router
│   │   ├── fsd.md              ← Guide Feature-Sliced Design
│   │   └── offline.md          ← Patterns offline-first + sync
│   ├── commands/
│   │   ├── new-feature.md      ← Template pour créer une feature FSD
│   │   ├── new-entity.md       ← Template pour créer une entité DB
│   │   └── new-endpoint.md     ← Template pour créer un endpoint API
│   └── handoff/
│       └── README.md           ← Instructions pour reprendre le projet
│
├── frontend/                   ← React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── app/                ← Bootstrap, providers, router
│   │   │   ├── providers/
│   │   │   ├── router.tsx
│   │   │   └── store.ts
│   │   ├── pages/              ← Routes (FSD layer)
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── schedule/
│   │   │   ├── grades/
│   │   │   ├── payments/
│   │   │   └── settings/
│   │   ├── features/           ← Logique métier (FSD layer)
│   │   │   ├── auth/
│   │   │   ├── student-management/
│   │   │   ├── grade-entry/
│   │   │   ├── schedule-builder/
│   │   │   ├── payment-tracking/
│   │   │   └── offline-sync/
│   │   ├── entities/           ← Modèles & API calls (FSD layer)
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   ├── classroom/
│   │   │   ├── school/
│   │   │   ├── payment/
│   │   │   └── notification/
│   │   ├── shared/             ← Réutilisable partout (FSD layer)
│   │   │   ├── ui/             ← shadcn/ui components
│   │   │   ├── api/            ← axios instance, interceptors
│   │   │   ├── i18n/           ← Traductions (fr, ln, sw)
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── widgets/            ← Blocs composites (FSD layer)
│   │       ├── sidebar/
│   │       ├── header/
│   │       └── stats-cards/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── backend/                    ← Express + TypeScript + Drizzle
    ├── src/
    │   ├── index.ts            ← Entry point
    │   ├── app.ts              ← Express app setup
    │   ├── db/
    │   │   ├── schema/         ← Drizzle schema (1 fichier par domaine)
    │   │   │   ├── school.ts
    │   │   │   ├── users.ts
    │   │   │   ├── academic.ts
    │   │   │   ├── finance.ts
    │   │   │   └── index.ts
    │   │   ├── migrations/
    │   │   └── index.ts        ← Drizzle client
    │   ├── modules/            ← 1 dossier par domaine métier
    │   │   ├── auth/
    │   │   │   ├── auth.router.ts
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.service.ts
    │   │   │   └── auth.schema.ts    ← Zod validation
    │   │   ├── schools/
    │   │   ├── students/
    │   │   ├── teachers/
    │   │   ├── classrooms/
    │   │   ├── grades/
    │   │   ├── schedules/
    │   │   ├── payments/
    │   │   └── notifications/
    │   ├── middleware/
    │   │   ├── auth.middleware.ts
    │   │   ├── rbac.middleware.ts
    │   │   └── error.middleware.ts
    │   ├── shared/
    │   │   ├── types/
    │   │   ├── utils/
    │   │   └── constants/
    │   └── config/
    │       ├── env.ts           ← Variables d'env typées (Zod)
    │       └── redis.ts
    ├── drizzle.config.ts
    ├── tsconfig.json
    └── package.json
```

## Règle FSD stricte

Les imports ne peuvent aller que **vers le bas** :
```
pages → features → entities → shared
widgets → features → entities → shared
```
Jamais d'import circulaire. Jamais `features` qui importe `pages`.
