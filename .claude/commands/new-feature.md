# Command — Nouvelle feature FSD

> Utiliser ce template quand tu crées une nouvelle feature.
> Remplacer `{name}` par le nom de la feature en kebab-case (ex: `grade-entry`).

## Structure à créer

```
frontend/src/features/{name}/
├── index.ts              ← Public API (exports uniquement)
├── ui/
│   ├── {Name}form.tsx
│   └── {Name}List.tsx
├── model/
│   ├── use-{name}.ts     ← Hook principal de la feature
│   └── store.ts          ← Slice RTK si état global nécessaire
└── lib/
    └── validators.ts     ← Zod schemas pour les formulaires
```

## Checklist

- [ ] Créer le dossier `features/{name}/`
- [ ] `index.ts` n'exporte que ce qui est nécessaire aux layers supérieurs
- [ ] Les imports n'utilisent que `entities/` et `shared/` (jamais d'autres features)
- [ ] Le hook principal gère `isLoading`, `isError`, et l'état vide
- [ ] Formulaires validés avec Zod + react-hook-form
- [ ] Composants accessibles (labels, aria, keyboard nav)
- [ ] Offline : mutations critiques passent par la sync queue

## Exemple — `grade-entry`

```typescript
// features/grade-entry/index.ts
export { GradeEntryForm } from './ui/GradeEntryForm'
export { useGradeEntry } from './model/use-grade-entry'
```

```typescript
// features/grade-entry/model/use-grade-entry.ts
import { useCreateAcademicPeriod } from '@/entities/grade'
import { useOfflineQueue } from '@/features/offline-sync' // OK : shared concern

export function useGradeEntry(examId: string) {
  const createGrade = useCreateAcademicPeriod()
  const { enqueue } = useOfflineQueue()

  const submitGrade = async (data: GradeFormData) => {
    if (!navigator.onLine) {
      enqueue({ type: 'CREATE_GRADE', payload: data })
      return
    }
    await createGrade.mutateAsync(data)
  }

  return { submitGrade, isPending: createGrade.isPending }
}
```
