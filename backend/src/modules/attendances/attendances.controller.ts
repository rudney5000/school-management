import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import {
    attendanceQuerySchema,
    BulkUpsertStudentAttendanceDto,
    BulkUpsertTeacherAttendanceDto,
    CreateStudentAttendanceDto,
    CreateTeacherAttendanceDto,
    SubSchoolQueryDto,
    UpdateStudentAttendanceDto,
    UpdateTeacherAttendanceDto
} from "@/modules/attendances/attendances.schema";
import {
    StudentAttendanceService,
    TeacherAttendanceService
} from "@/modules/attendances/attendances.service";

function resolveSubSchoolId(req: Request): string {
    if (req.user?.subSchoolId) {
        return req.user.subSchoolId;
    }
    return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class StudentAttendanceController {
    private readonly service = new StudentAttendanceService();

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const query = attendanceQuerySchema.parse({
            ...req.query,
            subSchoolId,
        });
        const data = await this.service.findAll(query);
        respond(res, data);
    });

    getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const data = await this.service.findById(req.params.id, subSchoolId);
        respond(res, data);
    });

    create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.create(
            req.body as CreateStudentAttendanceDto,
        );
        respond(res, data, 201);
    });

    bulkUpsert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.bulkUpsert(
            req.body as BulkUpsertStudentAttendanceDto,
        );
        respond(res, data, 201);
    });

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const data = await this.service.update(
            req.params.id,
            subSchoolId,
            req.body as UpdateStudentAttendanceDto,
        );
        respond(res, data);
    });

    remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        await this.service.delete(req.params.id, subSchoolId);
        res.status(204).send();
    });
}

export class TeacherAttendanceController {
    private readonly service = new TeacherAttendanceService();

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const query = attendanceQuerySchema.parse({
            ...req.query,
            subSchoolId,
        });
        const data = await this.service.findAll(query);
        respond(res, data);
    });

    getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const data = await this.service.findById(req.params.id, subSchoolId);
        respond(res, data);
    });

    create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.create(
            req.body as CreateTeacherAttendanceDto,
        );
        respond(res, data, 201);
    });

    bulkUpsert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.bulkUpsert(
            req.body as BulkUpsertTeacherAttendanceDto,
        );
        respond(res, data, 201);
    });

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        const data = await this.service.update(
            req.params.id,
            subSchoolId,
            req.body as UpdateTeacherAttendanceDto,
        );
        respond(res, data);
    });

    remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subSchoolId = resolveSubSchoolId(req);
        await this.service.delete(req.params.id, subSchoolId);
        res.status(204).send();
    });
}