import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/utils/async-handler'
import { respond } from '@/shared/utils/respond'
import { GradesService } from './grades.service'
import type {
    CreateGradeInput,
    UpdateGradeInput,
    BulkCreateGradesInput,
} from './grades.schema'

function resolveSubSchoolId(req: Request): string {
    return req.user?.subSchoolId ?? (req.query.subSchoolId as string)
}

export class GradesController {
    private readonly service = new GradesService()

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const { classId, courseId, academicPeriodId, studentId } = req.query as Record<string, string>
        const data = await this.service.findAll(subSchoolId, {
            classId,
            courseId,
            academicPeriodId,
            studentId,
        })
        respond(res, data)
    })

    getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findById(req.params.id, subSchoolId)
        respond(res, data)
    })

    create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const gradedBy = req.user!.id
        const data = await this.service.create({
            ...(req.body as CreateGradeInput),
            subSchoolId,
            gradedBy,
        })
        respond(res, data, 201)
    })

    bulkCreate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const gradedBy = req.user!.id
        const data = await this.service.bulkCreate(
            req.body as BulkCreateGradesInput,
            subSchoolId,
            gradedBy,
        )
        respond(res, data, 201)
    })

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.update(
            req.params.id,
            subSchoolId,
            req.body as UpdateGradeInput,
        )
        respond(res, data)
    })

    remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        await this.service.delete(req.params.id, subSchoolId)
        res.status(204).send()
    })
}