import type {
    Request,
    Response
} from 'express'
import { asyncHandler } from '@/shared/utils/async-handler'
import { respond } from '@/shared/utils/respond'
import {
    ExamsService,
    ExamResultsService
} from '@/modules/exams/exams.service'
import {
    BulkUpsertExamResultsInput,
    CreateExamInput,
    UpdateExamInput
} from "@/modules/exams/exams.schema";

function resolveSubSchoolId(req: Request): string {
    if (req.user?.subSchoolId) return req.user.subSchoolId
    return (req.query as { subSchoolId: string }).subSchoolId
}

export class ExamsController {
    private readonly service = new ExamsService()

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const { classId, teacherOnly } = req.query as { classId?: string; teacherOnly?: boolean }

        const data = await this.service.findAll(subSchoolId, {
            classId,
            teacherUserId: teacherOnly ? req.user!.id : undefined,
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
        const data = await this.service.create({
            ...(req.body as CreateExamInput),
            subSchoolId,
            createdBy: req.user!.id,
        })
        respond(res, data, 201)
    })

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.update(
            req.params.id,
            subSchoolId,
            req.body as UpdateExamInput,
        )
        respond(res, data)
    })

    remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        await this.service.delete(req.params.id, subSchoolId)
        res.status(204).send()
    })
}

export class ExamResultsController {
    private readonly service = new ExamResultsService()

    getByExam = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findByExam(req.params.examId, subSchoolId)
        respond(res, data)
    })

    getByStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findByStudent(req.params.studentId, subSchoolId)
        respond(res, data)
    })

    bulkUpsert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.bulkUpsert(
            req.body as BulkUpsertExamResultsInput,
            subSchoolId,
            req.user!.id,
            req.user!.role
        )
        respond(res, data)
    })
}