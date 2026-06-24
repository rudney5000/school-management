import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/utils/async-handler'
import { respond } from '@/shared/utils/respond'
import { AcademicPeriodsService } from './academic-periods.service'
import type {
    CreateAcademicPeriodInput,
    UpdateAcademicPeriodInput,
} from './academic-periods.schema'

function resolveSubSchoolId(req: Request): string {
    return req.user?.subSchoolId ?? (req.query.subSchoolId as string)
}

export class AcademicPeriodsController {
    private readonly service = new AcademicPeriodsService()

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findAll(subSchoolId)
        respond(res, data)
    })

    getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findById(req.params.id, subSchoolId)
        respond(res, data)
    })

    create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.create({
            ...(req.body as CreateAcademicPeriodInput),
            subSchoolId,
        })
        respond(res, data, 201)
    })

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.update(
            req.params.id,
            subSchoolId,
            req.body as UpdateAcademicPeriodInput,
        )
        respond(res, data)
    })

    remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        await this.service.delete(req.params.id, subSchoolId)
        res.status(204).send()
    })
}