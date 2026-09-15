import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateSubSchoolDto,
  UpdateSubSchoolDto,
} from '@/modules/sub-schools/sub-schools.schema';
import { SubSchoolsService } from '@/modules/sub-schools/sub-schools.service';
import { AppError } from '@/shared/errors/app-error';
import { resolveSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class SubSchoolsController {
  private readonly service = new SubSchoolsService();

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
    const input = req.body as CreateSubSchoolDto;
    const schoolId = resolveSchoolId(req);

    if (input.schoolId !== schoolId) {
      throw new AppError('FORBIDDEN', 'Accès refusé à cette école', 403);
    }

    const data = await this.service.create(input);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    const data = await this.service.update(req.params.id, schoolId, req.body as UpdateSubSchoolDto);
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    await this.service.remove(req.params.id, schoolId);
    res.status(204).send();
  });
}
