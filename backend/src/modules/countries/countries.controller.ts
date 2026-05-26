import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type { CreateCountryDto, UpdateCountryDto } from '@/modules/countries/countries.schema';
import { CountriesService } from '@/modules/countries/countries.service';

export class CountriesController {
  private readonly service = new CountriesService();

  getAll = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAll();
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateCountryDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.update(req.params.id, req.body as UpdateCountryDto);
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
