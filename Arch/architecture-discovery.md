# Architecture Discovery

## Repository analysed

- Repository/project name: school-management
- Date: 2026-09-06
- Analyst: ArchTect C4 Architect integration
- Request: Generate a complete Structurizr DSL architecture for the school-management monorepo. Include the React/Vite frontend, Tauri desktop shell, Express/TypeScript backend, shared PDF templates package, PostgreSQL, Redis, MinIO/S3-compatible object storage, LiveKit, and external users/systems. Include context, container, component-level backend modules, and deployment views. Write only DSL architecture artifacts plus supporting discovery documentation under the requested output root. Do not create Mermaid .mmd files.

## Evidence inspected

| Area                      | Files / folders                                                                                                                                  | Notes                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Build/dependencies        | package.json<br>backend/package.json<br>packages/pdf-templates/package.json<br>frontend/package.json<br>backend/Dockerfile<br>docker-compose.yml | Docker, Node.js                            |
| Application entry points  | .: dev<br>.: dev:backend<br>.: dev:frontend<br>backend: dev<br>backend: start<br>frontend: dev                                                   | 15 module(s) inferred                      |
| APIs/routes               | school_backend -> school_hub_pdf_templates<br>school_frontend -> school_hub_pdf_templates                                                        | 2 relationship hint(s)                     |
| Data/storage              | PostgreSQL Database<br>Redis Cache<br>MinIO/S3-Compatible Storage                                                                                | Derived from generated architecture model  |
| Messaging/events          | -                                                                                                                                                | Event or queue hints from manifests/docs   |
| Infrastructure/deployment | backend/Dockerfile<br>docker-compose.yml<br>docker-compose.yml                                                                                   | Deployment hints found in repository files |
| CI/CD                     | -                                                                                                                                                | Documentation and workflow hints only      |
| Existing docs             | backend/README.md<br>.claude/handoff/README.md                                                                                                   | 2 documentation hint(s)                    |

## Primary software system

| Identifier        | Name              | Description                                     | Evidence                                                               |
| ----------------- | ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| school_management | School Management | The main system for managing school operations. | ., backend, docker-compose.yml, docker-compose.yml, docker-compose.yml |

## People / actors

| Identifier | Name | Description                                 | Evidence / assumption                             |
| ---------- | ---- | ------------------------------------------- | ------------------------------------------------- |
| user       | User | External users interacting with the system. | Derived from generated project architecture model |

## Containers

| Identifier     | Name                        | Description                            | Technology       | Evidence                                                 |
| -------------- | --------------------------- | -------------------------------------- | ---------------- | -------------------------------------------------------- |
| frontend       | Frontend                    | React/Vite based frontend application. | React, Vite      | Within School Management; inferred from project evidence |
| backend        | Backend                     | Express/TypeScript based backend API.  | Node.js, Express | Within School Management; inferred from project evidence |
| database       | PostgreSQL Database         | Stores application data.               | PostgreSQL       | Within School Management; inferred from project evidence |
| cache          | Redis Cache                 | Caches frequently accessed data.       | Redis            | Within School Management; inferred from project evidence |
| object_storage | MinIO/S3-Compatible Storage | Stores files and documents.            | MinIO            | Within School Management; inferred from project evidence |
| livekit        | LiveKit                     | Real-time communication service.       | LiveKit          | Within School Management; inferred from project evidence |
