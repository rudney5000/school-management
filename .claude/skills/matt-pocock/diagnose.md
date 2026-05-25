# Skill — diagnose (Matt Pocock × School Management)

> Source originale : https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnose/SKILL.md
> Adapté pour les problèmes typiques de ce projet (offline, multi-tenant, auth).

## Usage dans Cursor

```
@.claude/skills/matt-pocock/diagnose.md

[Décris le bug ou le comportement inattendu]
```

---

## Comportement attendu de l'agent

Suis cette boucle de diagnostic stricte. Ne propose pas de fix avant d'avoir complété les étapes 1 à 4.

### Étape 1 — Reproduire de façon minimale
- Quel est le comportement attendu vs observé ?
- Dans quelles conditions exactes ça se produit ?
- Est-ce reproductible à 100% ? Ou aléatoire ?
- Explore le codebase pour trouver le code concerné

### Étape 2 — Minimiser
- Supprime les variables inutiles jusqu'au cas le plus simple qui reproduit le bug
- Questions à poser : est-ce lié au rôle utilisateur ? Au `subSchoolId` ? Au mode offline ?

### Étape 3 — Hypothèses (liste, ne choisis pas encore)
Génère 3 hypothèses plausibles classées par probabilité :
```
1. [Hypothèse la plus probable] — pourquoi c'est suspect
2. [Hypothèse alternative] — pourquoi c'est possible
3. [Hypothèse longshot] — cas limite
```

### Étape 4 — Instrumenter
Avant de modifier quoi que ce soit :
- Ajoute des logs / console.log ciblés pour confirmer l'hypothèse 1
- Vérifie les valeurs réelles vs attendues
- Pour les bugs réseau : check les headers, le status code, le body complet

### Étape 5 — Fix minimal
- Corrige uniquement ce qui est nécessaire
- Pas de refactoring pendant le debug
- Résiste à "tant que j'y suis..."

### Étape 6 — Test de régression
- Écris un test qui aurait détecté ce bug
- Vérifie que le test était rouge avant le fix, vert après

---

## Bugs typiques de ce projet à diagnostiquer en priorité

| Symptôme | Cause probable |
|----------|----------------|
| 403 inattendu | `subSchoolId` manquant dans le JWT ou mauvais rôle RBAC |
| Données d'une autre école visibles | Filtre `subSchoolId` absent dans la query |
| Mutation perdue après reconnexion | Sync queue offline non implémentée ou mal réjouée |
| TanStack Query re-fetch en boucle | `queryKey` instable (objet créé à chaque render) |
| Token expiré en production | Proactive refresh non configuré, RTK `baseQueryWithReauth` |
| Drizzle query lente | Index manquant sur FK ou colonne filtrée |
