import { ApiWrapper } from '@shared/api/ApiWrapper'
import { baseApi } from '@shared/api/instance'
import type {
    Conversation,
    Message
} from '@entities/chat/model/types'
import type {
    AddMembersInput,
    AddReactionInput,
    CreateConversationInput,
    EditMessageInput,
    SendMessageInput
} from "@entities/chat/model/createConversationSchema";
import type {AttachmentUploadResult, PresignUploadInput} from "@entities/chat/model/dto.ts";

export class ChatApi extends ApiWrapper {
    constructor() {
        super(baseApi)
    }

    getConversations(subSchoolId: string) {
        return this.handleRequest<Conversation[]>(
            this._baseApi.get('/chats', { subSchoolId }),
            (raw) => raw as Conversation[],
        )
    }

    getConversation(id: string) {
        return this.handleRequest<Conversation>(
            this._baseApi.get(`/chats/${id}`),
            (raw) => raw as Conversation,
        )
    }

    createConversation(payload: CreateConversationInput) {
        return this.handleRequest<Conversation>(
            this._baseApi.post('/chats', payload),
            (raw) => raw as Conversation,
        )
    }

    addMembers(id: string, payload: AddMembersInput) {
        return this.handleRequest<{ success: boolean }>(
            this._baseApi.post(`/chats/${id}/members`, payload),
            (raw) => raw as { success: boolean },
        )
    }

    removeMember(id: string, userId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/chats/${id}/members/${userId}`),
            undefined,
        )
    }

    getMessages(conversationId: string, params?: { limit?: number; before?: string }) {
        return this.handleRequest<Message[]>(
            this._baseApi.get(`/chats/${conversationId}/messages`, params),
            (raw) => raw as Message[],
        )
    }

    sendMessage(conversationId: string, payload: SendMessageInput) {
        return this.handleRequest<Message>(
            this._baseApi.post(`/chats/${conversationId}/messages`, payload),
            (raw) => raw as Message,
        )
    }

    editMessage(conversationId: string, messageId: string, payload: EditMessageInput) {
        return this.handleRequest<Message>(
            this._baseApi.patch(`/chats/${conversationId}/messages/${messageId}`, payload),
            (raw) => raw as Message,
        )
    }

    deleteMessage(conversationId: string, messageId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/chats/${conversationId}/messages/${messageId}`),
            undefined,
        )
    }

    markAsRead(conversationId: string, messageId: string) {
        return this.handleRequest<{ success: boolean }>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/read`, {}),
            (raw) => raw as { success: boolean },
        )
    }

    addReaction(conversationId: string, messageId: string, payload: AddReactionInput) {
        return this.handleRequest<{ success: boolean }>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/reactions`, payload),
            (raw) => raw as { success: boolean },
        )
    }

    removeReaction(conversationId: string, messageId: string, emoji: string) {
        return this.handleRequest(
            this._baseApi.delete(`/chats/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`),
            undefined,
        )
    }

    starMessage(conversationId: string, messageId: string) {
        return this.handleRequest<{ success: boolean }>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/star`, {}),
            (raw) => raw as { success: boolean },
        )
    }

    unstarMessage(conversationId: string, messageId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/chats/${conversationId}/messages/${messageId}/star`),
            undefined,
        )
    }

    archiveMessage(conversationId: string, messageId: string) {
        return this.handleRequest<{ success: boolean }>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/archive`, {}),
            (raw) => raw as { success: boolean },
        )
    }

    unarchiveMessage(conversationId: string, messageId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/chats/${conversationId}/messages/${messageId}/archive`),
            undefined,
        )
    }

    forwardMessage(conversationId: string, messageId: string, targetConversationId: string) {
        return this.handleRequest<Message>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/forward`, {
                targetConversationId,
            }),
            (raw) => raw as Message,
        )
    }

    getThreadReplies(conversationId: string, messageId: string) {
        return this.handleRequest<Message[]>(
            this._baseApi.get(`/chats/${conversationId}/messages/${messageId}/thread`),
            (raw) => raw as Message[],
        )
    }

    replyToThread(conversationId: string, messageId: string, payload: SendMessageInput) {
        return this.handleRequest<Message>(
            this._baseApi.post(`/chats/${conversationId}/messages/${messageId}/thread`, payload),
            (raw) => raw as Message,
        )
    }

    presignUpload(payload: PresignUploadInput) {
        return this.handleRequest<AttachmentUploadResult>(
            this._baseApi.post('/attachments/presign', payload),
            (raw) => raw as AttachmentUploadResult,
        )
    }
}

export const chatApi = new ChatApi()