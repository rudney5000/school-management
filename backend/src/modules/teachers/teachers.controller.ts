import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  AssignTeacherDto,
  CreateTeacherWithAssignmentDto,
  SubSchoolQueryDto, UpdateAssignmentDto,
  UpdateTeacherDto,
} from '@/modules/teachers/teachers.schema';
import { TeachersService } from '@/modules/teachers/teachers.service';

function resolveSubSchoolId(req: Request): string {
  if (req.user?.subSchoolId) {
    return req.user.subSchoolId;
  }
  return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class TeachersController {
  private readonly service = new TeachersService();

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
    const data = await this.service.create(req.body as CreateTeacherWithAssignmentDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateTeacherDto,
    );
    respond(res, data);
  });

  assign = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.assignToSchool(
        req.params.id,
        req.body as AssignTeacherDto,
    );
    respond(res, data, 201);
  });

  updateAssignment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.updateAssignment(
        req.params.id,
        subSchoolId,
        req.body as UpdateAssignmentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
