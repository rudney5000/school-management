import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { CreateSessionDto } from '@/modules/videoCalls/videoCalls.schema';
import { VideoCallsService } from '@/modules/videoCalls/videoCalls.service';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class VideoCallsController {
  private readonly service = new VideoCallsService();

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const userId = req.user!.id;

    const data = await this.service.create(req.body as CreateSessionDto, subSchoolId, userId);
    respond(res, data, 201);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.sessionId, subSchoolId);
    respond(res, data);
  });

  join = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const userId = req.user!.id;
    const userName = req.user!.email;

    const data = await this.service.join(req.params.sessionId, subSchoolId, userId, userName);
    respond(res, data);
  });

  leave = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    await this.service.leave(req.params.sessionId, userId);
    res.status(204).send();
  });

  end = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const userId = req.user!.id;

    await this.service.end(req.params.sessionId, subSchoolId, userId);
    res.status(204).send();
  });
}
