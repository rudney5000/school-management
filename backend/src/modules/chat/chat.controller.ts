import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/utils/async-handler'
import { respond } from '@/shared/utils/respond'
import { ChatService } from './chat.service'
import {
    CreateConversationInput,
    UpdateConversationInput,
    SendMessageInput,
    AddReactionInput,
    AddMembersInput,
    editMessageSchema,
    ForwardMessageInput,
} from './chat.schema'

function resolveSubSchoolId(req: Request): string {
    if (req.user?.subSchoolId) return req.user.subSchoolId
    return (req.query as { subSchoolId: string }).subSchoolId
}

export class ChatController {
    private readonly service = new ChatService()

    getConversations = asyncHandler(async (req: Request, res: Response) => {
        const subSchoolId = resolveSubSchoolId(req)
        const data = await this.service.findUserConversations(req.user!.id, subSchoolId)
        respond(res, data)
    })

    getConversation = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.findById(req.params.id, req.user!.id)
        respond(res, data)
    })

    createConversation = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.create(req.body as CreateConversationInput, req.user!.id)
        respond(res, data, 201)
    })

    updateConversation = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.update(
            req.params.id,
            req.user!.id,
            req.body as UpdateConversationInput,
        )
        respond(res, data)
    })

    addMembers = asyncHandler(async (req: Request, res: Response) => {
        await this.service.addMembers(req.params.id, req.user!.id, req.body as AddMembersInput)
        respond(res, { success: true })
    })

    removeMember = asyncHandler(async (req: Request, res: Response) => {
        await this.service.removeMember(req.params.id, req.user!.id, req.params.userId)
        res.status(204).send()
    })

    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const { limit, before } = req.query as { limit?: string; before?: string }
        const data = await this.service.findMessages(
            req.params.id,
            req.user!.id,
            limit ? parseInt(limit) : 50,
            before,
        )
        respond(res, data)
    })

    sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.sendMessage(
            req.params.id,
            req.user!.id,
            req.body as SendMessageInput,
        )
        respond(res, data, 201)
    })

    editMessage = asyncHandler(async (req: Request, res: Response) => {
        const input = editMessageSchema.parse(req.body)

        const data = await this.service.editMessage(
            req.params.messageId,
            req.user!.id,
            input
        )
        respond(res, data)
    })

    deleteMessage = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.deleteMessage(req.params.messageId, req.user!.id)
        respond(res, data)
    })

    markAsRead = asyncHandler(async (req: Request, res: Response) => {
        await this.service.markAsRead(req.params.id, req.user!.id, req.params.messageId)
        respond(res, { success: true })
    })

    addReaction = asyncHandler(async (req: Request, res: Response) => {
        await this.service.addReaction(
            req.params.messageId,
            req.user!.id,
            req.body as AddReactionInput,
        )
        respond(res, { success: true })
    })

    removeReaction = asyncHandler(async (req: Request, res: Response) => {
        await this.service.removeReaction(
            req.params.messageId,
            req.user!.id,
            req.params.emoji,
        )
        res.status(204).send()
    })

    starMessage = asyncHandler(async (req: Request, res: Response) => {
        await this.service.starMessage(req.params.messageId, req.user!.id)
        respond(res, { success: true })
    })

    unstarMessage = asyncHandler(async (req: Request, res: Response) => {
        await this.service.unstarMessage(req.params.messageId, req.user!.id)
        res.status(204).send()
    })

    archiveMessage = asyncHandler(async (req: Request, res: Response) => {
        await this.service.archiveMessage(req.params.messageId, req.user!.id)
        respond(res, { success: true })
    })

    unarchiveMessage = asyncHandler(async (req: Request, res: Response) => {
        await this.service.unarchiveMessage(req.params.messageId, req.user!.id)
        res.status(204).send()
    })

    forwardMessage = asyncHandler(async (req: Request, res: Response) => {
        const { targetConversationId } = req.body as ForwardMessageInput
        const data = await this.service.forwardMessage(
            req.params.messageId,
            targetConversationId,
            req.user!.id,
        )
        respond(res, data, 201)
    })

    getThreadReplies = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.findThreadReplies(
            req.params.messageId,
            req.user!.id,
        )
        respond(res, data)
    })

    replyToThread = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.replyToThread(
            req.params.messageId,
            req.user!.id,
            req.body as SendMessageInput,
        )
        respond(res, data, 201)
    })
}