# Skill — grill-with-docs (Matt Pocock × School Management)

> Source originale : https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
> Adapté pour le projet school-management Africa.

## Usage dans Cursor

Dans le chat Cursor :
```
@.claude/skills/matt-pocock/grill-with-docs.md

Je veux construire [description de la feature]. Grill-moi.
```

---

## Comportement attendu de l'agent

Interroge-moi sans relâche sur chaque aspect du plan jusqu'à ce qu'on atteigne une compréhension partagée. Descends chaque branche de l'arbre de décision, en résolvant les dépendances une par une. Pour chaque question, fournis ta réponse recommandée.

**Pose les questions une par une**, en attendant ma réponse avant de continuer.

Si une question peut être répondue en explorant le codebase, explore-le.

---

## Conscience du domaine — fichiers à consulter

Avant de commencer, explore :
- `claude.md` — stack et vision
- `MEMORY.md` — décisions déjà prises, conventions
- `STRUCTURE.md` — architecture FSD
- `docs/PRD.md` — fonctionnalités prévues
- `docs/ADR.md` — décisions d'architecture existantes
- `CONTEXT.md` — vocabulaire du domaine (à créer si absent)

---

## Pendant la session

### Défie contre le vocabulaire existant
Si j'utilise un terme qui contredit `CONTEXT.md`, signale-le immédiatement.
> "Tu définis 'filière' comme X dans le contexte, mais tu sembles vouloir dire Y — lequel est correct ?"

### Affine le langage flou
Propose un terme canonique précis pour les mots vagues.
> "Tu dis 'compte' — veux-tu dire SubSchool ou School ? Ce sont des choses différentes."

### Teste avec des scénarios concrets
Pour les relations de domaine, stress-teste avec des cas limites spécifiques au contexte africain :
- Que se passe-t-il si la connexion coupe en pleine saisie de notes ?
- Que se passe-t-il si un parent paie en Mobile Money mais le réseau répond en retard ?
- Que se passe-t-il si un élève est dans deux filières simultanément ?

### Vérifie la cohérence avec le code
Si j'affirme qu'une chose fonctionne d'une certaine façon, vérifie si le schéma DB / le code existant confirme.

### Met à jour `CONTEXT.md` en direct
Quand un terme est résolu, mets à jour `CONTEXT.md` immédiatement — pas en batch.

**Format CONTEXT.md :**
```md
## Glossaire

### SubSchool (filiale)
Une entité scolaire autonome rattachée à une School parente.
Possède ses propres élèves, enseignants, classes et paiements.
Filtre de référence pour l'isolation multi-tenant.

### Worker
Tout membre du personnel d'une SubSchool (enseignant, directeur, agent admin).
Distinct de Teacher qui est un Worker avec un rôle pédagogique.
```

### Propose des ADRs avec parcimonie
Crée un ADR uniquement si les 3 conditions sont réunies :
1. **Difficile à inverser** — le coût de changer d'avis est significatif
2. **Surprenant sans contexte** — un futur lecteur se demanderait "pourquoi ?"
3. **Résultat d'un vrai trade-off** — il y avait des alternatives réelles

Si une des trois manque, pas d'ADR.

**Format ADR dans `docs/ADR.md` :**
```md
## ADR-00X — Titre court

**Date** : YYYY-MM
**Statut** : ✅ Accepté / 🔄 En discussion / ❌ Rejeté

**Contexte** : Pourquoi on a dû choisir.
**Décision** : Ce qu'on a choisi.
**Raisons** : Liste courte.
**Conséquences** : Ce que ça implique.
```
