import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import {EventsService} from "@/modules/events/events.service";
import {createEventSchema, UpdateEventDto} from "@/modules/events/events.schema";
import {SubSchoolQueryDto} from "@/modules/students/students.schema";

function resolvesSubSchoolId(req: Request): string {
  if (req.user?.subSchoolId) {
    return req.user.subSchoolId;
  }
  return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class EventsController {
  private readonly service = new EventsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { subSchoolId: _, ...restOfData } = createEventSchema.parse(req.body);
    const userId = req.user!.id;
    const secureData = {
      ...restOfData,
      subSchoolId: req.user!.subSchoolId || req.user!.schoolId,
    };

    const data = await this.service.create(secureData, userId);

    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    const data = await this.service.update(
        req.params.id,
        subSchoolId,
        req.body as UpdateEventDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolvesSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
