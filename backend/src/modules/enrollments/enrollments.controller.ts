import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type { CreateEnrollmentDto } from '@/modules/enrollments/enrollments.schema';
import { EnrollmentsService } from '@/modules/enrollments/enrollments.service';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class EnrollmentsController {
  private readonly service = new EnrollmentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const { classId, studentId } = req.query as { classId?: string; studentId?: string };
    const data = await this.service.findAll(subSchoolId, { classId, studentId });
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.create(req.body as CreateEnrollmentDto, subSchoolId);
    respond(res, data, 201);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
