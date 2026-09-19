# Architecture DSL

Cette arborescence décrit le monorepo `school-management` avec Structurizr DSL uniquement.

- `workspace.dsl` : modèle C4 complet, composants backend et déploiement Docker Compose.
- `frontend.dsl` : application React/Vite, shell Tauri, état offline et temps réel.
- `backend.dsl` : API Express, modules métier, persistance, documents, workers et intégrations.
- `notifications.dsl` : authentification par téléphone (mot de passe + OTP SMS) et pipeline de notifications SMS via android-sms-gateway (Redis Streams, webhook, réconciliation) — ADR-005, ADR-006, ADR-007.
- `infrastructure.dsl` : déploiement des services Docker Compose.
- `pdf-templates.dsl` : package partagé `@school-hub/pdf-templates`.
- `architecture-discovery.md` et `c4-generation-notes.md` : traces de découverte et hypothèses.

Aucun fichier Mermaid `.mmd` n'est généré ici.
