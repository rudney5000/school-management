# ADR — Architecture Decision Records

> Format : contexte · décision · conséquences · statut

---

## ADR-001 — Drizzle ORM vs Prisma

**Date** : 2025-01  
**Statut** : ✅ Accepté

**Contexte** : Choix de l'ORM pour PostgreSQL. Prisma est plus populaire, Drizzle plus récent mais plus performant.

**Décision** : Drizzle ORM.

**Raisons** :
- Type-safety SQL native sans génération de code externe
- Bundle size réduit (important pour les connexions lentes)
- Meilleure performance sur les queries complexes (emplois du temps, bulletins)
- API SQL-like plus lisible pour les requêtes multi-joins

**Conséquences** :
- DX légèrement plus verbeux qu'Prisma pour les relations
- Moins de ressources/tutos disponibles en ligne
- Migrations manuelles via `drizzle-kit`

---

## ADR-002 — FSD (Feature-Sliced Design) pour le frontend

**Date** : 2025-01  
**Statut** : ✅ Accepté

**Contexte** : Le projet a ~10 domaines métier distincts (élèves, notes, paiements...). Architecture nécessaire pour éviter le couplage.

**Décision** : Feature-Sliced Design strict (pages → features → entities → shared).

**Raisons** :
- Séparation claire par domaine métier
- Scalabilité : ajout de features sans casser l'existant
- Cohérent avec l'expérience Eventra existante

**Conséquences** :
- Courbe d'apprentissage pour les nouveaux contributeurs
- Discipline stricte sur les imports (ESLint rule `import/no-restricted-paths`)

---

## ADR-003 — Offline-first avec IndexedDB + Sync Queue

**Date** : 2025-01  
**Statut** : ✅ Accepté

**Contexte** : Les écoles en RDC ont des coupures internet fréquentes. L'appli doit fonctionner sans réseau.

**Décision** : TanStack Query avec `persistQueryClient` (IndexedDB) + RTK slice `offlineQueue` pour les mutations.

**Raisons** :
- TanStack Query gère déjà le cache — on persiste ce cache
- La sync queue RTK permet de rejouer les mutations en attente à la reconnexion
- Pas besoin d'une lib externe complexe (PouchDB, etc.)

**Conséquences** :
- Complexité accrue sur les mutations (optimistic updates + queue)
- Gestion des conflits à implémenter (last-write-wins par défaut)
- Tests offline obligatoires dans la CI

---

## ADR-004 — Multi-tenant via `sub_school_id`

**Date** : 2025-01  
**Statut** : ✅ Accepté

**Contexte** : La plateforme gère plusieurs écoles et filiales sous un même compte.

**Décision** : Isolation par `sub_school_id` sur toutes les tables du domaine scolaire (row-level security).

**Raisons** :
- Schéma partagé (pas de DB par tenant) = infra simplifiée
- `sub_school_id` déjà présent dans le schéma existant
- RLS PostgreSQL activable pour sécurité additionnelle

**Conséquences** :
- Toutes les queries DOIVENT filtrer par `sub_school_id`
- Middleware qui injecte automatiquement le `sub_school_id` depuis le JWT

---

## ADR-005 — SMS via Africa's Talking (pas WhatsApp Business)

**Date** : 2025-01  
**Statut** : 🔄 En discussion

**Contexte** : Les parents n'ont pas tous WhatsApp. Le SMS reste le canal le plus universel en Afrique.

**Décision** : Africa's Talking pour les SMS (notifications critiques : notes publiées, paiement dû, absence).

**Raisons** :
- Coverage RDC + Congo-Brazzaville + Cameroun
- API simple, pricing à l'unité
- Pas de compte WhatsApp Business requis côté parent

**Conséquences** :
- Coût par SMS à intégrer dans le pricing
- Fallback in-app notification si SMS échoue
- WhatsApp Business à considérer en P3
