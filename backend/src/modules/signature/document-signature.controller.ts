import {
    Request,
    Response
} from 'express'
import type {
    BulletinSignDto,
    CertificateSignDto,
    EnrollmentSignDto,
    RevokeSignatureDto
} from '@/modules/signature/document-signature.schema'
import {asyncHandler} from "@/shared/utils/async-handler";
import {respond} from "@/shared/utils/respond";
import {
    DocumentSignaturesService
} from "@/modules/signature/document-signature.service";

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
        const data = await this.service.sign('bulletin', req.body as BulletinSignDto, signContext(req));
        respond(res, data, 201);
    });

    getBulletinStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.getStatus('bulletin', req.query as unknown as BulletinSignDto);
        respond(res, data);
    });

    signEnrollment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.sign('enrollment', req.body as EnrollmentSignDto, signContext(req));
        respond(res, data, 201);
    });

    getEnrollmentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.getStatus('enrollment', req.query as unknown as EnrollmentSignDto);
        respond(res, data);
    });

    signCertificate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.sign('certificate', req.body as CertificateSignDto, signContext(req));
        respond(res, data, 201);
    });

    revoke = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { reason } = req.body as RevokeSignatureDto;
        const data = await this.service.revoke(req.params.id, reason);
        respond(res, data);
    });
}