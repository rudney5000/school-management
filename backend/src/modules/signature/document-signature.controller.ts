import { Request, Response } from 'express';
import type {
  BulletinSignDto,
  CertificateSignDto,
  EnrollmentSignDto,
  PaymentReceiptSignDto,
  RevokeSignatureDto,
  TeacherContractSignDto,
} from '@/modules/signature/document-signature.schema';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { DocumentSignaturesService } from '@/modules/signature/document-signature.service';
import {
  assertSubSchoolAllowed,
  resolveSubSchoolId,
} from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';

/**
 * Every signature payload names its own `subSchoolId`. Left unchecked, a signer
 * could sign documents into any school by editing that field.
 */
async function scoped<T extends { subSchoolId?: string }>(req: Request, dto: T): Promise<T> {
  if (dto.subSchoolId) {
    await assertSubSchoolAllowed(req, dto.subSchoolId);
    return dto;
  }

  return { ...dto, subSchoolId: await resolveSubSchoolId(req) };
}

function signContext(req: Request) {
  return {
    signerRole: req.user!.role,
    signedByUserId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export class DocumentSignaturesController {
  private readonly service = new DocumentSignaturesService();

  signBulletin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.sign(
      'bulletin',
      await scoped(req, req.body as BulletinSignDto),
      signContext(req),
    );
    respond(res, data, 201);
  });

  signBulletinBatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.signBatch(
      'bulletin',
      await scoped(req, req.body as Partial<BulletinSignDto>),
      signContext(req),
    );
    respond(res, data, 201);
  });

  getBulletinStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getStatus(
      'bulletin',
      await scoped(req, req.query as unknown as BulletinSignDto),
    );
    respond(res, data);
  });

  getCertificateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getStatus(
      'certificate',
      await scoped(req, req.query as unknown as CertificateSignDto),
    );
    respond(res, data);
  });

  signEnrollment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.sign(
      'enrollment',
      await scoped(req, req.body as EnrollmentSignDto),
      signContext(req),
    );
    respond(res, data, 201);
  });

  getEnrollmentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getStatus(
      'enrollment',
      await scoped(req, req.query as unknown as EnrollmentSignDto),
    );
    respond(res, data);
  });

  signCertificate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.sign(
      'certificate',
      await scoped(req, req.body as CertificateSignDto),
      signContext(req),
    );
    respond(res, data, 201);
  });

  signTeacherContract = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.sign(
      'teacher_contract',
      await scoped(req, req.body as TeacherContractSignDto),
      signContext(req),
    );
    respond(res, data, 201);
  });

  getTeacherContractStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getStatus(
      'teacher_contract',
      await scoped(req, req.query as unknown as TeacherContractSignDto),
    );
    respond(res, data);
  });

  signPaymentReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.sign(
      'payment_receipt',
      await scoped(req, req.body as PaymentReceiptSignDto),
      signContext(req),
    );
    respond(res, data, 201);
  });

  getPaymentReceiptStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getStatus(
      'payment_receipt',
      await scoped(req, req.query as unknown as PaymentReceiptSignDto),
    );
    respond(res, data);
  });

  revoke = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { reason } = req.body as RevokeSignatureDto;
    const data = await this.service.revoke(req.params.id, reason, await resolveSubSchoolId(req));
    respond(res, data);
  });
}
