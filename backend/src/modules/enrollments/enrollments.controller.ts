import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type { CreateEnrollmentDto } from '@/modules/enrollments/enrollments.schema';
import { EnrollmentsService } from '@/modules/enrollments/enrollments.service';

export class EnrollmentsController {
  private readonly service = new EnrollmentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAll();
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateEnrollmentDto);
    respond(res, data, 201);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
