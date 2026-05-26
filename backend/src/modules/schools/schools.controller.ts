import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateSchoolDto,
  DistrictQueryDto,
  UpdateSchoolDto,
} from '@/modules/schools/schools.schema';
import { SchoolsService } from '@/modules/schools/schools.service';

export class SchoolsController {
  private readonly service = new SchoolsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const districtId = (req.query as DistrictQueryDto).districtId;
    const data = await this.service.findAll(districtId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateSchoolDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.update(
      req.params.id,
      req.body as UpdateSchoolDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
