import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateTeacherDto,
  SchoolQueryDto,
  UpdateTeacherDto,
} from '@/modules/teachers/teachers.schema';
import { TeachersService } from '@/modules/teachers/teachers.service';

function resolveSchoolId(req: Request): string {
  if (req.user?.schoolId) {
    return req.user.schoolId;
  }
  return (req.query as SchoolQueryDto).schoolId;
}

export class TeachersController {
  private readonly service = new TeachersService();

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
    const data = await this.service.create(req.body as CreateTeacherDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      schoolId,
      req.body as UpdateTeacherDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schoolId = resolveSchoolId(req);
    await this.service.remove(req.params.id, schoolId);
    res.status(204).send();
  });
}
