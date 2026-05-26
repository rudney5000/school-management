import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateStudentDto,
  SchoolQueryDto,
  UpdateStudentDto,
} from '@/modules/students/students.schema';
import {StudentsService} from "@/modules/students/students.service";

function resolveSchoolId(req: Request): string {
  if (req.user?.schoolId) {
    return req.user.schoolId;
  }
  return (req.query as SchoolQueryDto).schoolId;
}

export class StudentsController {
  private readonly service = new StudentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    const data = await this.service.findAll(schoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    const data = await this.service.findById(req.params.id, schoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateStudentDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateStudentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    await this.service.softDelete(req.params.id, schoolId);
    res.status(204).send();
  });
}
