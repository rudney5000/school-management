import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import type { CreatePaymentDto, UpdatePaymentDto } from '@/modules/payments/payments.schema';
import { PaymentsService } from '@/modules/payments/payments.service';
import { resolveSubSchoolId } from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/errors/app-error';

/** The parent profile to restrict a lookup to, or undefined for staff roles. */
async function parentScope(req: Request): Promise<string | undefined> {
  if (req.user!.role !== 'parent') {
    return undefined;
  }

  const [record] = await db
    .select({ parentId: users.parentId })
    .from(users)
    .where(eq(users.id, req.user!.id))
    .limit(1);

  if (!record?.parentId) {
    throw new AppError('FORBIDDEN', 'Aucun profil parent associé à ce compte', 403);
  }

  return record.parentId;
}

export class PaymentsController {
  private readonly service = new PaymentsService();

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findAll(subSchoolId);
    respond(res, data);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.findById(req.params.id, subSchoolId, await parentScope(req));
    respond(res, data);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.create(req.body as CreatePaymentDto, subSchoolId);
    respond(res, data, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    const data = await this.service.update(
      req.params.id,
      subSchoolId,
      req.body as UpdatePaymentDto,
    );
    respond(res, data);
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subSchoolId = await resolveSubSchoolId(req);
    await this.service.remove(req.params.id, subSchoolId);
    res.status(204).send();
  });
}
