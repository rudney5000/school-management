---
inclusion: fileMatch
fileMatchPattern: ['backend/**/*.ts']
---

# Règles Backend

## Express
- Router → Controller → Service → DB (toujours dans cet ordre)
- Pas de logique métier dans les controllers — uniquement orchestration
- Pas d'accès DB direct dans les controllers — passer par les services
- Réponses typées avec un helper `respond(res, data, status)` standard

## Validation
- Zod sur **chaque** endpoint (body, params, query)
- Schema Zod dans `<module>/<module>.schema.ts`
- Middleware de validation générique qui wrap le router
- Jamais de `req.body as SomeType` sans validation préalable

## Drizzle ORM
- Schema dans `db/schema/` — 1 fichier par domaine (`school.ts`, `users.ts`, etc.)
- Toujours utiliser les **relations Drizzle** pour les joins, pas de SQL raw sauf perf critique
- SQL raw documenté avec un commentaire expliquant pourquoi Drizzle ne suffit pas
- Migrations : `drizzle-kit generate` → review → `drizzle-kit migrate` (jamais push en prod)
- Nommage tables : `snake_case` pluriel (`students`, `school_classes`)
- Toujours `created_at` + `updated_at` sur chaque table (Drizzle `timestamps()` helper)
- Soft delete avec `deleted_at` nullable — pas de DELETE physique sur les données métier

## Authentification
- JWT access token (15min) + refresh token (7j) stockés séparément
- Refresh token en DB (`refresh_tokens` table) pour révocation
- Middleware `authenticate` → `authorize(roles[])` — dans cet ordre
- Jamais de logique RBAC dans les services — uniquement dans les middlewares/controllers

## Sécurité
- Helmet sur toutes les routes
- Rate limiting par IP (`express-rate-limit` + Redis store)
- CORS configuré explicitement — pas de `origin: '*'` en prod
- Pas de stack trace dans les réponses d'erreur en prod
- Variables d'env validées au démarrage avec Zod (`config/env.ts`)

## PostgreSQL
- Indexes sur toutes les FK et colonnes filtrées fréquemment
- Transactions Drizzle pour toute opération multi-table
- `sub_school_id` présent sur toutes les tables du domaine scolaire (isolation multi-tenant)
- Pas de `SELECT *` — toujours lister les colonnes nécessaires

## Redis
- Cache keys avec préfixe par domaine : `school:123:stats`, `user:456:session`
- TTL explicite sur chaque `SET` — jamais de clé sans expiration
- BullMQ pour les jobs asynchrones (PDF, SMS, emails)

## Gestion d'erreurs
- Classe `AppError extends Error` avec `statusCode` + `code` (string enum)
- Middleware `errorHandler` central en dernier dans `app.ts`
- Erreurs 4xx : problème client → message explicite
- Erreurs 5xx : problème serveur → message générique + log détaillé
