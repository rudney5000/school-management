import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateSubSchoolDto,
  SchoolQueryDto,
  UpdateSubSchoolDto,
} from '@/modules/sub-schools/sub-schools.schema';
import { SubSchoolsService } from '@/modules/sub-schools/sub-schools.service';

function resolveSchoolId(req: Request): string {
  if (req.user?.schoolId) {
    return req.user.schoolId;
  }
  return (req.query as SchoolQueryDto).schoolId;
}

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
    const data = await this.service.create(req.body as CreateSubSchoolDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      schoolId,
      req.body as UpdateSubSchoolDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    await this.service.remove(req.params.id, schoolId);
    res.status(204).send();
  });
}
