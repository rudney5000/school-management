import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { AppError } from '@/shared/errors/app-error';
import { ReportsService } from '@/modules/reports/reports.service';
import type {
  AssignReportDto,
  CreateReportDto,
  ReportFiltersDto,
  UpdateReportStatusDto,
} from '@/modules/reports/reports.schema';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

const ALLOWED_REPORTER_ROLES = ['student', 'parent', 'teacher'] as const;

export class ReportsController {
  private readonly service = new ReportsService();

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (
      !ALLOWED_REPORTER_ROLES.includes(req.user!.role as (typeof ALLOWED_REPORTER_ROLES)[number])
    ) {
      throw new AppError('FORBIDDEN', 'Ce rôle ne peut pas créer de signalement', 403);
    }

    const subSchoolId = await resolveSubSchoolId(req);
    if (!subSchoolId) {
      throw new AppError('BAD_REQUEST', 'Impossible de déterminer la sous-école', 400);
    }

    const report = await this.service.create(req.body as CreateReportDto, {
      userId: req.user!.id,
      role: req.user!.role,
      schoolId: req.user!.schoolId,
      subSchoolId,
    });

    respond(
      res,
      { ...report, trackingToken: report.isAnonymous ? report.trackingToken : undefined },
      201,
    );
  });

  myReports = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findByReporter(req.user!.id);
    respond(res, data);
  });

  trackByToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.findByTrackingToken(req.params.token);
    respond(res, data);
  });

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    if (!subSchoolId) {
      throw new AppError('BAD_REQUEST', 'Impossible de déterminer la sous-école', 400);
    }

    const data = await this.service.findAll(req.query as ReportFiltersDto, subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    if (!subSchoolId) {
      throw new AppError('BAD_REQUEST', 'Impossible de déterminer la sous-école', 400);
    }

    const data = await this.service.findById(req.params.id, subSchoolId);
    respond(res, data);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    if (!subSchoolId) {
      throw new AppError('BAD_REQUEST', 'Impossible de déterminer la sous-école', 400);
    }

    const data = await this.service.updateStatus(
      req.params.id,
      req.body as UpdateReportStatusDto,
      req.user!.id,
      subSchoolId,
    );
    respond(res, data);
  });

  assign = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    if (!subSchoolId) {
      throw new AppError('BAD_REQUEST', 'Impossible de déterminer la sous-école', 400);
    }

    const data = await this.service.assign(req.params.id, req.body as AssignReportDto, subSchoolId);
    respond(res, data);
  });
}
