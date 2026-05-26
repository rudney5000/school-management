import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateClassDto,
  SubSchoolQueryDto,
  UpdateClassDto,
} from '@/modules/classes/classes.schema';
import { ClassesService } from '@/modules/classes/classes.service';

function resolveSubSchoolId(req: Request): string {
  if (req.user?.subSchoolId) {
    return req.user.subSchoolId;
  }
  return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class ClassesController {
  private readonly service = new ClassesService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateClassDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateClassDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
