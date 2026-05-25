# PRD — School Management Africa

## Vision
Rendre la gestion scolaire accessible aux établissements africains : simple, fiable même sans internet, abordable, et adapté aux réalités locales (Mobile Money, multilangue, multi-devise).

## Cible
- **Primaire** : Écoles privées et instituts en RDC (Kinshasa, Lubumbashi, Goma)
- **Secondaire** : Expansion Cameroun, Congo-Brazzaville, Rwanda

## Personas

### Admin école (utilisateur principal)
Directeur ou secrétaire général. Gère les inscriptions, les paiements, les bulletins. Utilise un PC ou une tablette Android. Connexion internet instable.

### Enseignant
Saisit les notes, les présences. Utilise principalement un smartphone. Doit pouvoir travailler offline.

### Parent
Consulte les notes, les présences, les paiements. Reçoit des notifications SMS (pas forcément WhatsApp). Smartphone bas/moyen de gamme.

## Fonctionnalités — Priorité P1 (MVP)

| Feature | Description |
|---------|-------------|
| Auth multi-rôle | Login, JWT, RBAC (6 rôles) |
| Multi-école | Gestion de plusieurs établissements sous 1 compte |
| Élèves & classes | CRUD, inscriptions, promotions |
| Emplois du temps | Création, affichage, export PDF |
| Notes & bulletins | Saisie, calcul moyennes, génération PDF |
| Présences | Enseignants et élèves, rapports |
| Paiements frais | Suivi scolarité, reçus, relances |
| Notifications | In-app + SMS (Africa's Talking) |

## Fonctionnalités — Priorité P2

| Feature | Description |
|---------|-------------|
| Messagerie interne | Entre rôles (Socket.IO) |
| Payroll workers | Salaires, avances, fiches de paie |
| Mobile Money | Airtel Money, M-Pesa, Orange |
| Mode offline complet | Sync queue IndexedDB |
| i18n | Lingala, Swahili |
| Analytics | Tableaux de bord direction |

## Fonctionnalités — Priorité P3

| Feature | Description |
|---------|-------------|
| API publique | Intégrations tierces |
| On-premise | Docker image self-hosted |
| App mobile native | React Native |
| IA | Prédiction abandons scolaires |

## Modèle économique

| Plan | Prix | Limites |
|------|------|---------|
| Starter | 25 USD/mois | 1 école, 500 élèves |
| Pro | 60 USD/mois | 5 écoles, 3000 élèves |
| Enterprise | Sur devis | Illimité + on-premise |

Facturation en USD, paiement accepté en CDF et via Mobile Money.

## KPIs MVP

- 3 écoles pilotes en beta à Kinshasa
- < 3s chargement dashboard sur 3G
- 100% des features critiques fonctionnelles offline
- NPS > 40 après 1 mois d'utilisation
