import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  ConfirmSignatureImageDto,
  CreateWorkerDto,
  PresignSignatureImageDto,
  UpdateWorkerDto,
} from '@/modules/workers/workers.schema';
import { WorkersService } from '@/modules/workers/workers.service';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class WorkersController {
  private readonly service = new WorkersService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateWorkerDto);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.update(req.params.id, subSchoolId, req.body as UpdateWorkerDto);
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });

  presignSignatureImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const workerId = await this.service.findWorkerIdByUserId(req.user!.id);
    const data = await this.service.presignSignatureImage(
      workerId,
      subSchoolId,
      req.body as PresignSignatureImageDto,
    );
    respond(res, data);
  });

  confirmSignatureImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const workerId = await this.service.findWorkerIdByUserId(req.user!.id);
    const data = await this.service.confirmSignatureImage(
      workerId,
      subSchoolId,
      req.body as ConfirmSignatureImageDto,
    );
    respond(res, data);
  });
}
