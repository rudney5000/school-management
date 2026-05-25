# Command — Nouvel endpoint backend

> Template pour créer un module backend complet.
> Remplacer `{name}` par le nom du module (ex: `students`).

## Fichiers à créer

```
backend/src/modules/{name}/
├── {name}.router.ts
├── {name}.controller.ts
├── {name}.service.ts
└── {name}.schema.ts      ← Zod validation schemas
```

## Template — schema.ts

```typescript
import { z } from 'zod'

export const create{Name}Schema = z.object({
  subSchoolId: z.string().uuid(),
  // ... champs
})

export const update{Name}Schema = create{Name}Schema.partial().omit({ subSchoolId: true })

export const {name}ParamsSchema = z.object({
  id: z.string().uuid(),
})

export type Create{Name}Dto = z.infer<typeof create{Name}Schema>
export type Update{Name}Dto = z.infer<typeof update{Name}Schema>
```

## Template — router.ts

```typescript
import { Router } from 'express'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/rbac.middleware'
import { validate } from '@/shared/utils/validate'
import { {Name}Controller } from './{name}.controller'
import { create{Name}Schema, {name}ParamsSchema } from './{name}.schema'

const router = Router()
const controller = new {Name}Controller()

router.get('/', authenticate, authorize(['admin_school', 'director']), controller.getAll)
router.get('/:id', authenticate, validate({ params: {name}ParamsSchema }), controller.getById)
router.post('/', authenticate, authorize(['admin_school']), validate({ body: create{Name}Schema }), controller.create)
router.patch('/:id', authenticate, authorize(['admin_school']), validate({ params: {name}ParamsSchema, body: update{Name}Schema }), controller.update)
router.delete('/:id', authenticate, authorize(['admin_school']), validate({ params: {name}ParamsSchema }), controller.remove)

export { router as {name}Router }
```

## Template — controller.ts

```typescript
import type { Request, Response } from 'express'
import { {Name}Service } from './{name}.service'

export class {Name}Controller {
  private service = new {Name}Service()

  getAll = async (req: Request, res: Response) => {
    const { subSchoolId } = req.user // injecté par authenticate middleware
    const data = await this.service.findAll(subSchoolId)
    res.json({ data })
  }

  getById = async (req: Request, res: Response) => {
    const data = await this.service.findById(req.params.id, req.user.subSchoolId)
    res.json({ data })
  }

  create = async (req: Request, res: Response) => {
    const data = await this.service.create(req.body)
    res.status(201).json({ data })
  }

  update = async (req: Request, res: Response) => {
    const data = await this.service.update(req.params.id, req.body)
    res.json({ data })
  }

  remove = async (req: Request, res: Response) => {
    await this.service.softDelete(req.params.id)
    res.status(204).send()
  }
}
```

## Checklist

- [ ] Schema Zod défini pour create + update + params
- [ ] RBAC : quels rôles ont accès à chaque route ?
- [ ] Service filtre toujours par `subSchoolId`
- [ ] Soft delete (pas de DELETE physique)
- [ ] Enregistrer le router dans `app.ts`
