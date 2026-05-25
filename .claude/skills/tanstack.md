# Skill — TanStack Query

> Patterns à suivre pour ce projet.

## Query Keys — constantes typées

```typescript
// frontend/src/entities/student/api/keys.ts
export const STUDENT_KEYS = {
  all: ['students'] as const,
  bySchool: (subSchoolId: string) => ['students', subSchoolId] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
}
```

## Query — fetch liste

```typescript
// frontend/src/entities/student/api/queries.ts
export function useStudents(subSchoolId: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.bySchool(subSchoolId),
    queryFn: () => api.get<Student[]>(`/students?subSchoolId=${subSchoolId}`),
    staleTime: 60_000, // 1 min
  })
}
```

## Mutation — avec invalidation

```typescript
export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentDto) => api.post<Student>('/students', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.bySchool(variables.subSchoolId),
      })
    },
  })
}
```

## Gestion des états dans le composant

```typescript
function StudentList() {
  const { data, isLoading, isError, error } = useStudents(subSchoolId)

  if (isLoading) return <StudentListSkeleton />
  if (isError) return <ErrorMessage message={error.message} />
  if (!data?.length) return <EmptyState message="Aucun élève inscrit" />

  return <ul>{data.map(s => <StudentCard key={s.id} student={s} />)}</ul>
}
```

## Offline — persistQueryClient

```typescript
// frontend/src/app/providers/QueryProvider.tsx
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createIDBPersister } from '@/shared/lib/idb-persister'

persistQueryClient({
  queryClient,
  persister: createIDBPersister('school-query-cache'),
  maxAge: 1000 * 60 * 60 * 24, // 24h
})
```
