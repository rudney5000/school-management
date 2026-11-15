import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { AppError } from '@/shared/errors/app-error';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';
import { CurriculaService } from './curricula.service';
import { CurriculumFilesService } from './curricula.files.service';
import { resolveFamilyClassIds } from './curricula.access';
import type { CurriculumViewer } from './curricula.types';
import type {
  ConfirmCurriculumFileDto,
  CreateCurriculumDto,
  ListCurriculaQuery,
  PresignCurriculumFileDto,
  UpdateCurriculumDto,
} from './curricula.schema';

const MANAGER_ROLES = ['admin', 'director', 'super_admin'];

export class CurriculaController {
  private readonly service = new CurriculaService();
  private readonly files = new CurriculumFilesService();

  /** Works out what the caller may read, from the role and the token only. */
  private async viewer(req: Request): Promise<CurriculumViewer> {
    const user = req.user;
    if (!user) throw new AppError('UNAUTHORIZED', 'Utilisateur non authentifié', 401);

    if (user.role === 'parent' || user.role === 'student') {
      return {
        kind: 'family',
        classIds: await resolveFamilyClassIds(user.id, user.role),
      };
    }

    const subSchoolId = await resolveSubSchoolId(req);
    return MANAGER_ROLES.includes(user.role)
      ? { kind: 'manager', subSchoolId }
      : { kind: 'teacher', subSchoolId };
  }

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const viewer = await this.viewer(req);
    const data = await this.service.list(viewer, req.query as ListCurriculaQuery);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const viewer = await this.viewer(req);
    const data = await this.service.findById(req.params.id, viewer);
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.create(
      subSchoolId,
      req.user!.id,
      req.body as CreateCurriculumDto,
    );
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdateCurriculumDto,
    );
    respond(res, data);
  });

  publish = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.setStatus(req.params.id, subSchoolId, 'published');
    respond(res, data);
  });

  unpublish = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.setStatus(req.params.id, subSchoolId, 'draft');
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });

  presignFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.files.presign(
      req.params.id,
      subSchoolId,
      req.body as PresignCurriculumFileDto,
    );
    respond(res, data);
  });

  confirmFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.files.confirm(
      req.params.id,
      subSchoolId,
      req.user!.id,
      req.body as ConfirmCurriculumFileDto,
    );
    respond(res, data, 201);
  });

  removeFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.files.remove(req.params.id, req.params.attachmentId, subSchoolId);
    res.status(204).send();
  });

  download = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const viewer = await this.viewer(req);
    const data = await this.files.downloadUrl(req.params.id, req.params.attachmentId, viewer);
    respond(res, data);
  });
}
