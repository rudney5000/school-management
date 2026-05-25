# Skill — tdd (Matt Pocock × School Management)

> Source originale : https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md
> Adapté pour le projet : Vitest (frontend) + Jest/Supertest (backend).

## Usage dans Cursor

```
@.claude/skills/matt-pocock/tdd.md

Je veux implémenter [feature/bug]. Utilise TDD.
```

---

## Comportement attendu de l'agent

Construis cette feature en utilisant une **boucle red-green-refactor** stricte, une tranche verticale à la fois.

### Règles absolues
1. **Écris le test qui échoue en premier** — jamais de code de production avant un test rouge
2. **Fais passer le test avec le minimum de code** — résiste à l'over-engineering
3. **Refactorise ensuite** — seulement quand les tests sont verts
4. **Une tranche à la fois** — termine une slice avant d'en commencer une autre

### Ce qu'est un bon test dans ce projet

```typescript
// ✅ BON — teste un comportement observable
it('should return 401 when token is expired', async () => {
  const res = await request(app)
    .get('/api/students')
    .set('Authorization', `Bearer ${expiredToken}`)
  expect(res.status).toBe(401)
  expect(res.body.code).toBe('TOKEN_EXPIRED')
})

// ✅ BON — teste la logique métier isolée
it('should calculate trimester average correctly', () => {
  const grades = [{ value: 14, coefficient: 2 }, { value: 16, coefficient: 1 }]
  expect(calculateAverage(grades)).toBe(14.67)
})

// ❌ MAUVAIS — teste les détails d'implémentation
it('should call db.select once', () => { ... })

// ❌ MAUVAIS — trop large, teste tout en même temps
it('should create student, enroll in class, and send SMS', () => { ... })
```

### Stack de test

| Couche | Outil | Commande |
|--------|-------|----------|
| Frontend composants | Vitest + Testing Library | `pnpm --filter frontend test` |
| Frontend hooks/utils | Vitest | idem |
| Backend endpoints | Jest + Supertest | `pnpm --filter backend test` |
| Backend services | Jest | idem |
| E2E (optionnel P2) | Playwright | `pnpm test:e2e` |

### Spécificités du projet

- **Offline** : tester les mutations quand `navigator.onLine = false`
- **Multi-tenant** : chaque test doit créer ses propres données avec un `subSchoolId` isolé
- **RBAC** : tester chaque endpoint avec un token par rôle (admin, teacher, parent)

```typescript
// Helper pour les tests backend
const createTestContext = async () => {
  const school = await db.insert(schools).values({ name: 'Test School' }).returning()
  const subSchool = await db.insert(subSchools).values({ schoolId: school[0].id }).returning()
  const adminToken = generateToken({ role: 'admin_school', subSchoolId: subSchool[0].id })
  return { subSchool: subSchool[0], adminToken }
}
```
