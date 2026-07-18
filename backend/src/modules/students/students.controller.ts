import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import {
  CreateStudentDto,
  SubSchoolQueryDto,
  UpdateStudentDto,
} from '@/modules/students/students.schema';
import {StudentsService} from "@/modules/students/students.service";

function resolvesSubSchoolId(req: Request): string {
  if (req.user?.subSchoolId) {
    return req.user.subSchoolId;
  }
  return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class StudentsController {
  private readonly service = new StudentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  getUnassigned = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.findUnassigned(subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateStudentDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateStudentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    await this.service.softDelete(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
