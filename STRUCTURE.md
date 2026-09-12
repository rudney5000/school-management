# STRUCTURE — Arborescence du projet

```
school-management/
├── claude.md                   ← Contexte IA principal (lu à chaque prompt)
├── MEMORY.md                   ← Décisions & mémoire persistante
├── STRUCTURE.md                ← Ce fichier
├── docker-compose.yml          ← PostgreSQL + Redis + MinIO + LiveKit
├── .env.example
│
├── docs/
│   ├── PRD.md                  ← Product Requirements Document
│   ├── ADR.md                  ← Architecture Decision Records
│   └── BILAN.md                ← Audit de l'état réel du projet (2026-09)
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
│   │   ├── fsd.md              ← (prévu, pas encore créé)
│   │   └── offline.md          ← (prévu, pas encore créé — offline-first non implémenté)
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
│   │   │   ├── router/
│   │   │   ├── i18n/            ← Traductions (fr, en, ru, ln — sw pas encore fait)
│   │   │   └── theme/
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
│   │   │   └── offline-sync/    ← (prévu, pas encore créé)
│   │   ├── entities/           ← Modèles & API calls (FSD layer) — 18 entités au 2026-09
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   ├── class/
│   │   │   ├── school/
│   │   │   ├── payment/
│   │   │   └── ... (exams, grades, chat, document-signature, video-call, etc.)
│   │   ├── shared/             ← Réutilisable partout (FSD layer)
│   │   │   ├── ui/             ← shadcn/ui components
│   │   │   ├── api/            ← axios instance, interceptors
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
    │   │   │   ├── payments.ts
    │   │   │   └── index.ts
    │   │   ├── migrations/
    │   │   └── index.ts        ← Drizzle client
    │   ├── modules/            ← 1 dossier par domaine métier — 27 modules au 2026-09
    │   │   ├── auth/
    │   │   │   ├── auth.router.ts
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.service.ts
    │   │   │   └── auth.schema.ts    ← Zod validation
    │   │   ├── schools/, sub-schools/, students/, teachers/, parents/, workers/
    │   │   ├── classes/, courses/, grades/, exams/, schedules/, attendances/, enrollments/
    │   │   ├── payments/, reports/, attachments/, document-pdf/, signature/
    │   │   ├── chat/, liveSessions/, videoCalls/, events/, academic-periods/
    │   │   ├── countries/, cities/, districts/, departments/
    │   │   └── notifications/       ← ⚠️ PAS ENCORE créé (mentionné ici et dans backend/README.md mais absent de src/modules)
    │   ├── middleware/
    │   │   ├── authenticate.ts      ← (nommé auth.middleware.ts dans ce plan initial)
    │   │   ├── authorize.ts         ← (nommé rbac.middleware.ts dans ce plan initial)
    │   │   ├── error-handler.ts     ← (nommé error.middleware.ts dans ce plan initial)
    │   │   └── restrict-to-own-child.ts
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
