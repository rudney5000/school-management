import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateDepartmentDto,
  DepartmentListQueryDto,
  UpdateDepartmentDto,
} from '@/modules/departments/departments.schema';
import { DepartmentsService } from '@/modules/departments/departments.service';

export class DepartmentsController {
  private readonly service = new DepartmentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAll(req.query as DepartmentListQueryDto);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateDepartmentDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.update(req.params.id, req.body as UpdateDepartmentDto);
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
