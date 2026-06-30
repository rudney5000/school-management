import { Router } from 'express'
import { ChatController } from './chat.controller'
import { authenticate } from '@/middleware/authenticate'
import { authorize } from '@/middleware/authorize'
import { validate } from '@/shared/utils/validate'
import {
    createConversationSchema,
    updateConversationSchema,
    sendMessageSchema,
    editMessageSchema,
    addReactionSchema,
    addMembersSchema,
    conversationParamsSchema,
    messageParamsSchema,
    messagesQuerySchema,
    forwardMessageSchema,
} from './chat.schema'
import { subSchoolQuerySchema } from '@/modules/students/students.schema'

const controller = new ChatController()
const router = Router()

const allRoles = ['admin', 'director', 'teacher', 'student', 'parent', 'super_admin'] as const

router.get(
    '/',
    authenticate,
    authorize(...allRoles),
    validate({
        query: subSchoolQuerySchema
    }),
    controller.getConversations,
)

router.get(
    '/:id',
    authenticate,
    authorize(...allRoles),
    validate({
        params: conversationParamsSchema
    }),
    controller.getConversation,
)

router.post(
    '/',
    authenticate,
    authorize(...allRoles),
    validate({
        body: createConversationSchema
    }),
    controller.createConversation,
)

router.post('/:id/messages/:messageId/star',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.starMessage,
)

router.post('/:id/messages/:messageId/archive',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.archiveMessage,
)

router.post('/:id/messages/:messageId/forward',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema,
        body: forwardMessageSchema
    }),
    controller.forwardMessage,
)

router.post('/:id/messages/:messageId/thread',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema,
        body: sendMessageSchema
    }),
    controller.replyToThread,
)

router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin'),
    validate({
        params: conversationParamsSchema,
        body: updateConversationSchema
    }),
    controller.updateConversation,
)

router.post(
    '/:id/members',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin'),
    validate({
        params: conversationParamsSchema,
        body: addMembersSchema
    }),
    controller.addMembers,
)

router.delete(
    '/:id/members/:userId',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin'),
    validate({
        params: conversationParamsSchema
    }),
    controller.removeMember,
)

router.delete('/:id/messages/:messageId/star',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.unstarMessage,
)

router.delete('/:id/messages/:messageId/archive',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.unarchiveMessage,
)

router.get(
    '/:id/messages',
    authenticate,
    authorize(...allRoles),
    validate({
        params: conversationParamsSchema,
        query: messagesQuerySchema
    }),
    controller.getMessages,
)

router.get('/:id/messages/:messageId/thread',
    authenticate, authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.getThreadReplies,
)

router.post(
    '/:id/messages',
    authenticate,
    authorize(...allRoles),
    validate({
        params: conversationParamsSchema,
        body: sendMessageSchema
    }),
    controller.sendMessage,
)

router.patch(
    '/:id/messages/:messageId',
    authenticate,
    authorize(...allRoles),
    validate({
        params: messageParamsSchema,
        body: editMessageSchema
    }),
    controller.editMessage,
)

router.delete(
    '/:id/messages/:messageId',
    authenticate,
    authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.deleteMessage,
)

router.post(
    '/:id/messages/:messageId/read',
    authenticate,
    authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.markAsRead,
)

router.post(
    '/:id/messages/:messageId/reactions',
    authenticate,
    authorize(...allRoles),
    validate({
        params: messageParamsSchema,
        body: addReactionSchema
    }),
    controller.addReaction,
)

router.delete(
    '/:id/messages/:messageId/reactions/:emoji',
    authenticate,
    authorize(...allRoles),
    validate({
        params: messageParamsSchema
    }),
    controller.removeReaction,
)

export { router as chatRouter };