# Architecture DSL

Cette arborescence décrit le monorepo `school-management` avec Structurizr DSL uniquement.

- `workspace.dsl` : modèle C4 complet, composants backend et déploiement Docker Compose.
- `frontend.dsl` : application React/Vite, shell Tauri, état offline et temps réel.
- `backend.dsl` : API Express, modules métier, persistance, documents, workers et intégrations.
- `notifications.dsl` : package interne `packages/notifications` (comme `pdf-templates`, consommé uniquement par `backend`) — authentification multi-identifiants (email/téléphone/username) + OTP SMS, pipeline de notifications SMS via android-sms-gateway (Redis Streams, webhook, réconciliation) — ADR-005, ADR-006, ADR-007, ADR-008.
- `infrastructure.dsl` : déploiement des services Docker Compose.
- `pdf-templates.dsl` : package partagé `@school-hub/pdf-templates`.
- `architecture-discovery.md` et `c4-generation-notes.md` : traces de découverte et hypothèses.

Aucun fichier Mermaid `.mmd` n'est généré ici.
