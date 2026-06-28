import type { RootState } from '@shared/store'
import type { Conversation, Message } from './types'

export const selectConversations = (state: RootState): Conversation[] => state.chat.conversations
export const selectActiveConversationId = (state: RootState): string | null => state.chat.activeConversationId
export const selectOnlineUsers = (state: RootState): string[] => state.chat.onlineUsers
export const selectTypingUsers = (state: RootState): Record<string, string[]> => state.chat.typingUsers

export const selectActiveConversation = (state: RootState): Conversation | null =>
    state.chat.conversations.find(c => c.id === state.chat.activeConversationId) ?? null

export const selectMessagesByConversation = (conversationId: string) =>
    (state: RootState): Message[] =>
        state.chat.messages[conversationId] ?? []

export const selectTypingUsersByConversation = (conversationId: string) =>
    (state: RootState): string[] =>
        state.chat.typingUsers[conversationId] ?? []

export const selectUnreadCount = (conversationId: string, userId: string) =>
    (state: RootState): number =>
        (state.chat.messages[conversationId] ?? [])
            .filter(m => !m.isDeleted && m.senderId !== userId).length


export const selectUnreadCountByConversation = (userId: string) =>
    (state: RootState): Record<string, number> => {
        const result: Record<string, number> = {}
        const { conversations, messages } = state.chat

        conversations.forEach(conv => {
            const member = conv.members.find(m => m.userId === userId)
            const lastReadAt = member?.lastReadAt ? new Date(member.lastReadAt) : null
            const convMessages = messages[conv.id] ?? []

            result[conv.id] = convMessages.filter(m =>
                m.senderId !== userId &&
                !m.isDeleted &&
                (!lastReadAt || new Date(m.createdAt) > lastReadAt)
            ).length
        })

        return result
    }
