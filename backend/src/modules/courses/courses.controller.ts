import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type {
  CreateCourseDto, CreateCourseResourceDto,
  SubSchoolQueryDto,
  UpdateCourseDto,
} from '@/modules/courses/courses.schema';
import { CoursesService } from '@/modules/courses/courses.service';
import {AppError} from "@/shared/errors/app-error";

function resolveSubSchoolId(req: Request): string {
  if (req.user?.subSchoolId) {
    return req.user.subSchoolId;
  }
  return (req.query as SubSchoolQueryDto).subSchoolId;
}

export class CoursesController {
  private readonly service = new CoursesService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getAllCoursesResource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findAllByCourse(req.params.id);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.create(req.body as CreateCourseDto);
    respond(res, data, 201);
  });

  // createCoursesResource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  //   const body = req.body as CreateCourseResourceDto;
  //   const uploadedUrl = req.file ? `/uploads/course-resources/${req.file.filename}` : undefined;
  //   const url = uploadedUrl ?? body.url;
  //
  //   if (!url) {
  //     throw new AppError('VALIDATION_ERROR', 'Un fichier ou une URL est requis', 400);
  //   }
  //
  //   const data = await this.service.create(req.params.id, { ...body, url });
  //   respond(res, data, 201);
  // });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateCourseDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });

  removeCoursesResource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.removeCourseResource(req.params.resourceId, req.params.id);
    res.status(204).send();
  });
}
