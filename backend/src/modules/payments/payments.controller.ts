import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
} from '@/modules/payments/payments.schema';
import { PaymentsService } from '@/modules/payments/payments.service';

export class PaymentsController {
  private readonly service = new PaymentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAll();
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findById(req.params.id);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreatePaymentDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.update(
      req.params.id,
      req.body as UpdatePaymentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id);
    res.status(204).send();
  });
}
