---
inclusion: fileMatch
fileMatchPattern: ['frontend/**/*.{ts,tsx}']
---

# Règles Frontend

## React
- Toujours des **composants fonctionnels**
- Props typées avec `type Props = { ... }` juste au-dessus du composant
- Pas de props drilling > 2 niveaux — utiliser Context ou RTK
- `useCallback` / `useMemo` uniquement si perf mesurée, pas par défaut
- Éviter les `useEffect` pour la data fetching — utiliser TanStack Query

## TanStack Query
- 1 fichier de queries par entité dans `entities/<name>/api/`
- Nommer les query keys en constantes : `STUDENT_KEYS = { all: ['students'], detail: (id) => [...] }`
- `staleTime` minimum 30s pour les données peu changeantes
- Toujours gérer `isLoading`, `isError`, et le cas vide (`data.length === 0`)
- Mutations : `onSuccess` invalidate les queries concernées

## TanStack Router
- Routes définies dans `src/app/router.tsx`
- Loaders pour précharger les données critiques d'une page
- Params typés via `z.object()` dans la définition de route

## RTK (Redux Toolkit)
- Uniquement pour état **global & persistant** : auth, theme, langue, offline queue
- Pas de RTK pour état serveur (→ TanStack Query) ni état local (→ useState)
- Slices dans `shared/store/`
- RTK Query uniquement si TanStack Query ne suffit pas (cas rares)

## Tailwind CSS v4
- Classes Tailwind uniquement — pas de `style={{}}` sauf valeurs dynamiques runtime
- Variantes responsive : `sm:`, `md:`, `lg:` — **mobile-first**
- Pas de classes arbitraires `[123px]` sauf exception documentée
- Composants shadcn/ui dans `shared/ui/` — ne pas modifier les fichiers générés directement

## FSD (Feature-Sliced Design)
- Imports : pages → features → entities → shared (jamais l'inverse)
- Chaque layer expose un `index.ts` (public API)
- Pas d'import cross-feature direct — passer par `shared/` ou `entities/`
- Nouvelle feature : créer avec le command `@.claude/commands/new-feature.md`

## Offline-first
- Toutes les mutations critiques passent par la **sync queue** (`features/offline-sync/`)
- Vérifier `navigator.onLine` avant les appels réseau sensibles
- UI doit indiquer clairement le statut offline (bannière, icône)
- IndexedDB via `idb` library pour la persistance locale

## Performance
- Images : toujours `loading="lazy"` sauf above-the-fold
- Bundle splitting : 1 chunk par page (lazy import dans le router)
- Ne jamais importer une lib entière si seul un sous-module est nécessaire
