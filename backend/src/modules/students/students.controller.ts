import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { CreateStudentDto, UpdateStudentDto } from '@/modules/students/students.schema';
import { StudentsService } from '@/modules/students/students.service';
import { AppError } from '@/shared/errors/app-error';
import {
  assertSubSchoolAllowed,
  resolveSubSchoolId,
} from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class StudentsController {
  private readonly service = new StudentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  getUnassigned = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findUnassigned(subSchoolId);
    respond(res, data);
  });

  getMyChildren = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);
    }

    const subSchoolId = await resolveSubSchoolId(req);
    const children = await this.service.resolveChildrenForParent(req.user.id, subSchoolId);
    respond(res, children);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const input = req.body as CreateStudentDto;
    await assertSubSchoolAllowed(req, input.subSchoolId);
    const data = await this.service.create(input);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateStudentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.service.softDelete(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
