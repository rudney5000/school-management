import { Server, Socket } from 'socket.io'
import type { Redis } from 'ioredis'
import { ChatService } from '@/modules/chat/chat.service'
import type { SendMessageInput, EditMessageInput, AddReactionInput } from '@/modules/chat/chat.schema'

const chatService = new ChatService()

export function registerChatHandlers(io: Server, socket: Socket, redis: Redis) {
    const userId = socket.data.userId

    socket.on('join_conversation', async (conversationId: string) => {
        try {
            await chatService['assertMember'](conversationId, userId)
            socket.join(conversationId)
            socket.emit('joined_conversation', { conversationId })
        } catch {
            socket.emit('error', { message: 'Accès refusé' })
        }
    })

    socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId)
    })

    socket.on('message:send', async (data: {
        conversationId: string
        input: SendMessageInput
    }) => {
        try {
            const message = await chatService.sendMessage(
                data.conversationId,
                userId,
                data.input,
            )

            io.to(data.conversationId).emit('message:new', message)
        } catch (err) {
            socket.emit('error', { message: 'Erreur envoi message' })
        }
    })

    socket.on('message:edit', async (data: {
        conversationId: string
        messageId: string
        input: EditMessageInput
    }) => {
        try {
            const message = await chatService.editMessage(data.messageId, userId, data.input)
            io.to(data.conversationId).emit('message:edited', message)
        } catch {
            socket.emit('error', { message: 'Erreur modification message' })
        }
    })

    socket.on('message:delete', async (data: {
        conversationId: string
        messageId: string
    }) => {
        try {
            const message = await chatService.deleteMessage(data.messageId, userId)
            io.to(data.conversationId).emit('message:deleted', {
                messageId: data.messageId,
                conversationId: data.conversationId,
            })
        } catch {
            socket.emit('error', { message: 'Erreur suppression message' })
        }
    })

    socket.on('message:read', async (data: {
        conversationId: string
        messageId: string
    }) => {
        try {
            await chatService.markAsRead(data.conversationId, userId, data.messageId)
            io.to(data.conversationId).emit('message:read', {
                messageId:      data.messageId,
                conversationId: data.conversationId,
                userId,
                readAt:         new Date(),
            })
        } catch {
            socket.emit('error', { message: 'Erreur lecture message' })
        }
    })

    socket.on('reaction:add', async (data: {
        conversationId: string
        messageId: string
        input: AddReactionInput
    }) => {
        try {
            await chatService.addReaction(data.messageId, userId, data.input)
            io.to(data.conversationId).emit('reaction:added', {
                messageId: data.messageId,
                userId,
                emoji:     data.input.emoji,
            })
        } catch {
            socket.emit('error', { message: 'Erreur réaction' })
        }
    })

    socket.on('reaction:remove', async (data: {
        conversationId: string
        messageId: string
        emoji: string
    }) => {
        try {
            await chatService.removeReaction(data.messageId, userId, data.emoji)
            io.to(data.conversationId).emit('reaction:removed', {
                messageId: data.messageId,
                userId,
                emoji:     data.emoji,
            })
        } catch {
            socket.emit('error', { message: 'Erreur suppression réaction' })
        }
    })

    socket.on('typing:start', async (conversationId: string) => {
        await redis.set(`typing:${conversationId}:${userId}`, '1', 'EX', 5)
        socket.to(conversationId).emit('user:typing', { userId, conversationId, isTyping: true })
    })

    socket.on('typing:stop', async (conversationId: string) => {
        await redis.del(`typing:${conversationId}:${userId}`)
        socket.to(conversationId).emit('user:typing', { userId, conversationId, isTyping: false })
    })
}