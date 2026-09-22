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

## ADR-005 — SMS via android-sms-gateway (pas Africa's Talking, pas WhatsApp Business)

**Date** : 2026-09  
**Statut** : ✅ Accepté (révise la décision initiale de 2025-01)

**Contexte** : Les parents n'ont pas tous WhatsApp. Le SMS reste le canal le plus universel en Afrique. Africa's Talking avait été envisagé initialement (ADR-005 v1), mais facture à l'unité — un coût récurrent difficile à absorber sur un pricing à 25-60 USD/mois avec des écoles à faible budget. Les écoles du pilote ont chacune une ligne mobile disponible et de l'argent déjà engagé dans leur forfait/carte SIM.

**Décision** : Chaque sous-école dispose d'un téléphone Android dédié faisant office de passerelle SMS, via l'app open-source [android-sms-gateway](https://github.com/capcom6/android-sms-gateway) (capcom6), utilisée en mode **Cloud Server** (compte cloud unique `api.sms-gate.app`, un `deviceId` par téléphone d'école, pas de mode local/private pour l'instant).

**Raisons** :
- Pas de coût par SMS — utilise le forfait/la SIM déjà payée par l'école
- Open-source, API REST simple, webhooks de statut de livraison (`sms:sent`, `sms:delivered`, `sms:failed`) avec signature HMAC-SHA256
- Mode Cloud Server : un seul compte gère plusieurs devices (un par école), ciblage par `deviceId`, pas de webhook à reconfigurer par école
- Plan gratuit largement suffisant pour le volume du pilote (seuil de vigilance : ~10 000 SMS/jour au total, à réévaluer si dépassé)

**Conséquences** :
- Débit d'envoi limité par le SIM de l'école elle-même (quelques SMS/minute en réglage prudent, pour ne pas se faire flaguer comme spam par l'opérateur) — une diffusion à toute la liste des parents d'une école prend du temps, pas instantané
- Dépendance à la disponibilité physique du téléphone-passerelle (batterie, coupure électrique, connexion data) — voir ADR-007 pour la tolérance aux pannes côté file d'attente
- Fallback in-app systématique : le SMS est une alerte en plus de l'info déjà visible dans l'app, jamais le seul endroit où elle existe
- WhatsApp Business et l'email (prévu ensuite) restent des canaux additionnels possibles via la même abstraction `notifications` (voir ADR-006/ADR-007) sans revoir l'architecture
- **Point de vigilance non résolu** : le compte cloud partagé (`api.sms-gate.app`) est un point de défaillance unique à l'échelle de *toute* la plateforme, pas seulement par école — un incident ou une suspension de ce compte coupe l'OTP et le provisioning pour toutes les écoles en même temps, contrairement à la panne d'un seul téléphone-passerelle. À traiter avant mise en prod (au minimum : le mot de passe/code d'activation reste consultable dans l'écran admin sans dépendre de la livraison SMS, et le job de réconciliation distingue un échec isolé d'un échec agrégé sur plusieurs écoles pour alerter l'opérateur plateforme). Non bloquant pour la conception ci-dessous, à trancher avant l'implémentation du provisioning.

---

## ADR-006 — Authentification multi-identifiants (email, téléphone, username) + OTP SMS

**Date** : 2026-09  
**Statut** : ✅ Accepté (v2 — révise le brouillon initial : `phone` n'est plus un identifiant obligatoire)

**Contexte** : L'auth actuelle est email + mot de passe uniquement (`users.email` unique, pas de `users.phone`). Un premier brouillon de cet ADR rendait `users.phone` obligatoire (`NOT NULL`), au même titre qu'`email`. Deux problèmes à ça : (1) ça impose un backfill de tous les comptes existants, et (2) ça fige l'architecture sur une contrainte motivée par un problème de connectivité propre au Congo-Brazzaville/Kinshasa aujourd'hui, alors que rien ne garantit qu'il sera encore vrai dans 5 à 10 ans. Certains comptes (élèves, personnel dont le contact passe par l'école) n'ont par ailleurs ni email ni téléphone personnel.

**Décision** :
- Trois identifiants de connexion possibles par compte — **email**, **téléphone** (E.164), **username** — chacun optionnel individuellement ; un compte doit en porter au moins un, mais jamais un en particulier n'est imposé.
- Unicité garantie par une table dédiée `user_identifiers` (`id`, `user_id`, `type` enum('email','phone','username'), `value`, `created_at`) avec une contrainte `UNIQUE` sur `value` **toutes valeurs confondues** : un username ne peut jamais coïncider avec l'email ou le téléphone d'un autre compte. Une simple contrainte `UNIQUE` par colonne sur `users` ne le garantirait pas (les trois colonnes seraient uniques chacune dans leur périmètre, pas entre elles).
- `users.email`, `users.phone`, `users.username` restent des colonnes d'affichage sur `users` (nullables), synchronisées à chaque écriture dans `user_identifiers` — pour ne pas casser le code existant qui les lit directement (reçus, module signature, tests). `user_identifiers` reste la seule source de vérité pour la connexion et l'unicité ; une consolidation vers une source unique partout est possible plus tard mais n'est pas nécessaire pour livrer vite.
- Connexion : un seul champ « identifiant » accepte email, username ou téléphone + mot de passe (`POST /auth/login`, résolution via `user_identifiers.value`) ; alternative sans mot de passe : téléphone + code OTP à 6 chiffres (`POST /auth/otp/request` puis `POST /auth/otp/verify`), code dans Redis avec TTL 5 min, tentatives limitées, réponse volontairement neutre pour ne pas révéler si un numéro est enregistré.
- Récupération de compte : l'utilisateur choisit son canal **parmi ceux disponibles sur son compte** — lien de réinitialisation par email, ou code OTP par téléphone. Pas de récupération par username seul (aucun canal de contact associé) : ces comptes restent réinitialisables uniquement par un admin, ce qui est cohérent avec le fait que ce sont des comptes gérés par l'école.

**Raisons** :
- Le mot de passe reste toujours une option de connexion, indépendamment du canal choisi pour la récupération → aucun utilisateur n'est bloqué si le téléphone-passerelle de son école est en panne ou hors-ligne
- Le Congo-Brazzaville et Kinshasa ont une connectivité instable aujourd'hui, mais un système qui verrouillerait tout sur le téléphone serait à revoir prématurément si la situation change dans les 5-10 ans à venir — laisser le choix du canal à l'utilisateur rend l'architecture indifférente à cette évolution
- « Au moins un identifiant parmi trois » ne demande aucune migration de données sur les comptes existants (ils ont déjà un email) — contrairement à un `phone NOT NULL`, qui aurait exigé un backfill
- Le username couvre les comptes sans email ni téléphone personnel (élèves, personnel dont le contact passe par l'école ou le parent)
- Cohérent avec le choix ADR-005 : réutilise le même pipeline `notifications`/gateway SMS pour l'OTP

**Conséquences** :
- Nouvelle table `user_identifiers` + colonnes nullables `phone`, `username` sur `users` — migration purement additive, aucun backfill requis
- Discipline de code à maintenir : toute création/modification d'identifiant écrit dans `user_identifiers` **et** met à jour la colonne miroir correspondante sur `users`
- Nouveaux endpoints : `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/password-reset/request` (email ou téléphone selon le choix de l'utilisateur), `POST /auth/password-reset/confirm`
- Anti-abus **bloquant avant mise en service**, pas une amélioration ultérieure : throttling des demandes d'OTP par numéro (ex. 1/60s, 5/heure), verrou après échecs répétés
- Le frontend gère un écran de connexion avec un seul champ identifiant + bascule « recevoir un code par SMS », et un écran de récupération avec choix du canal parmi ceux disponibles sur le compte
- **Point laissé ouvert** : mécanisme de provisioning d'un nouveau compte — mot de passe temporaire envoyé en clair par SMS (risque : lisible par quiconque a accès à un téléphone partagé, pas de TTL défini) vs code d'activation à usage unique réutilisant le mécanisme OTP (le compte choisit son propre mot de passe à l'activation, rien de lisible ne transite jamais par SMS). À trancher avant l'implémentation de cette partie précise.

---

## ADR-007 — File d'attente des envois SMS : Redis Streams (pas RabbitMQ, pas BullMQ)

**Date** : 2026-09  
**Statut** : ✅ Accepté

**Contexte** : Un SMS ne doit jamais être silencieusement perdu (crash worker, pic d'envoi, téléphone-passerelle hors-ligne). Redis tourne déjà dans le projet (`lib/redis.ts`, persistance `appendonly yes`) pour l'adapter Socket.IO. RabbitMQ apporterait des garanties de livraison au niveau broker mais ajoute une infra supplémentaire ; BullMQ (jobs sur Redis) apporte retries/backoff/rate-limit prêts à l'emploi mais masque le log brut des envois.

**Décision** : Utiliser **Redis Streams** avec consumer groups, un stream par téléphone-passerelle (`sms:out:<deviceId>` pour le bulk, `sms:otp:<deviceId>` pour le transactionnel), plutôt que RabbitMQ ou BullMQ.

**Raisons** :
- Persistance native via la PEL (pending entries list) : un message non `XACK`é après l'appel à la gateway reste récupérable (`XAUTOCLAIM`) si le worker crashe — combiné à `appendonly yes`, aucun SMS accepté par un worker n'est perdu
- Partitionnement naturel par école/device : chaque téléphone a son propre débit et sa propre file, une école ne bloque pas les autres
- Séparation transactionnel/bulk : les OTP et mots de passe temporaires (ADR-006) ne sont jamais retardés par une campagne de masse
- Observabilité native (`XLEN`, `XPENDING`, `XINFO STREAM`) sans outil supplémentaire
- Zéro nouvelle infra — Redis est déjà déployé et persisté

**Conséquences** :
- Le retry/backoff et le dead-letter (`sms:dead:<deviceId>`) doivent être implémentés à la main (pas de fonctionnalité prête à l'emploi comme BullMQ) : sorted set `sms:retry-schedule` (score = timestamp du prochain essai) + ticker qui repousse les entrées échues dans le stream
- `XACK` a lieu au moment où la gateway a accepté l'envoi, pas à la livraison confirmée — le cycle de vie complet (`sent`/`delivered`/`failed`) vit dans la table Postgres `notifications`, mise à jour par le webhook de la gateway (signature HMAC-SHA256 vérifiée) et, en secours, par un job de réconciliation qui poll `GET /messages/{id}` si aucun webhook n'arrive dans un délai donné
- Si RabbitMQ devient nécessaire plus tard (écosystème multi-services/multi-langages du plugin system), cette décision est à rouvrir — non exclu à long terme, simplement pas justifié à l'échelle du pilote
- **Point de vigilance non résolu** : aucune politique de purge/rétention n'est définie sur les streams (`MAXLEN` ou équivalent) — sans elle, `sms:out:<deviceId>` et `sms:otp:<deviceId>` croissent indéfiniment. À définir avant la mise en prod, pas nécessaire pour le pilote à faible volume.

---

## ADR-008 — `packages/notifications` comme package interne du monorepo

**Date** : 2026-09  
**Statut** : ✅ Accepté

**Contexte** : Le pipeline décrit par ADR-005/006/007 (auth multi-identifiants + OTP, dispatch SMS, webhook, réconciliation) a peu de couplage avec les modules métier de `backend/src/modules` (students, grades, payments...) — il ne fait que leur fournir un moyen d'envoyer une notification et de vérifier une identité. Le monorepo a déjà ce pattern de frontière avec `packages/pdf-templates`, partagé entre `backend` et `frontend`. La question posée était de savoir si ce même traitement valait pour l'auth/notifications, et si le package devait être conçu pour être réutilisable dans le monorepo "platform" ou le projet "sms" séparé mentionnés comme vision long terme.

**Décision** : Créer `packages/notifications`, package pnpm au même niveau que `packages/pdf-templates` (déjà couvert par le glob `packages/*` de `pnpm-workspace.yaml`, aucune modification de config nécessaire). Contrairement à `pdf-templates`, il n'est consommé que par `backend` (le frontend n'a pas besoin de logique d'envoi SMS). Portée volontairement restreinte à ce repo — pas d'effort de généricité pour une réutilisation dans "platform" ou "sms", cette réutilisation n'étant pas confirmée à ce stade.

Le sens de dépendance reste `backend → packages/notifications`, jamais l'inverse : le package ne dépend pas du schéma Drizzle de `backend/db`. Il déclare une petite interface (`NotificationStore`, `IdentifierStore`) que `backend` implémente et injecte, pour éviter un couplage circulaire et garder le package testable indépendamment de la connexion Postgres réelle.

Le worker Redis Streams tourne **in-process** avec l'API au démarrage du pilote (importé et démarré dans `backend/src/index.ts`) plutôt que comme process séparé — la frontière de package rend ce découplage possible plus tard sans réécriture, mais rien n'oblige à le payer dès maintenant sur un petit VPS.

**Raisons** :
- Frontière de code déjà naturelle, peu de couplage avec les modules métier
- Cohérent avec le pattern déjà en place (`pdf-templates`)
- Prépare un futur découplage du worker en process séparé sans réécriture
- Portée volontairement restreinte : pas de sur-ingénierie pour une réutilisation externe non confirmée

**Conséquences** :
- Nouveau `package.json` (`@school-hub/notifications` ou équivalent) — pas de changement à `pnpm-workspace.yaml`, le glob `packages/*` le couvre déjà
- `backend/src/modules/auth` appelle `packages/notifications` pour déclencher l'OTP ou le provisioning, mais garde la logique JWT/session propre à `backend`
- Le package expose une interface (`NotificationStore`, `IdentifierStore`) plutôt que d'importer directement `backend/src/db` — discipline à maintenir à l'implémentation
- **Aucun scaffolding fait à ce stade** — décision d'architecture seule ; la structure de fichiers, le `package.json` et le code restent à créer
