import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { CreateLiveSessionDto } from '@/modules/liveSessions/liveSessions.schema';
import { LiveSessionsService } from '@/modules/liveSessions/liveSessions.service';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

export class LiveSessionsController {
  private readonly service = new LiveSessionsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.sessionId, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const teacherId = req.user!.id;

    const data = await this.service.create(
      req.body as CreateLiveSessionDto,
      subSchoolId,
      teacherId,
    );
    respond(res, data, 201);
  });

  start = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const requesterId = req.user!.id;

    const data = await this.service.start(req.params.sessionId, subSchoolId, requesterId);
    respond(res, data);
  });

  end = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const requesterId = req.user!.id;

    const data = await this.service.end(req.params.sessionId, subSchoolId, requesterId);
    respond(res, data);
  });

  join = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const userId = req.user!.id;
    const userName = req.user!.email ?? 'Participant';

    const data = await this.service.join(req.params.sessionId, subSchoolId, userId, userName);
    respond(res, data);
  });

  leave = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    await this.service.leave(req.params.sessionId, userId);
    res.status(204).send();
  });
}
