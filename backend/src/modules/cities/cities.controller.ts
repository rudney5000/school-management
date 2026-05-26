import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CityListQueryDto,
  CreateCityDto,
  UpdateCityDto,
} from '@/modules/cities/cities.schema';
import { CitiesService } from '@/modules/cities/cities.service';

export class CitiesController {
  private readonly service = new CitiesService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAll(req.query as CityListQueryDto);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateCityDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.update(req.params.id, req.body as UpdateCityDto);
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
