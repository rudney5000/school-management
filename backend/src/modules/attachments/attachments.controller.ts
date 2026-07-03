import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/utils/async-handler'
import { respond } from '@/shared/utils/respond'
import {
    AttachmentsService
} from "@/modules/attachments/attachments.service";
import {PresignUploadInput} from "@/modules/attachments/attachments.schema";

export class AttachmentsController {
    private readonly service = new AttachmentsService()

    presign = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data = await this.service.presign(
            req.user!.id,
            req.body as PresignUploadInput,
        )
        respond(res, data)
    })
}