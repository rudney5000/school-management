import {createSlice, type PayloadAction, type Slice} from '@reduxjs/toolkit'
import type { Conversation, Message } from './types'

export interface ChatState {
    conversations:         Conversation[]
    activeConversationId:  string | null
    messages:              Record<string, Message[]>
    onlineUsers:           string[]
    typingUsers:           Record<string, string[]>
}

const initialState: ChatState = {
    conversations:        [],
    activeConversationId: null,
    messages:             {},
    onlineUsers:          [],
    typingUsers:          {},
}

export const chatSlice: Slice<ChatState> = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setConversations(state, action: PayloadAction<Conversation[]>) {
            state.conversations = action.payload
        },

        setActiveConversation(state, action: PayloadAction<string | null>) {
            state.activeConversationId = action.payload
        },

        setMessages(state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) {
            state.messages[action.payload.conversationId] = action.payload.messages
        },

        messageReceived(state, action: PayloadAction<Message>) {
            const msg = action.payload
            const existing = state.messages[msg.conversationId] ?? []
            if (!existing.find(m => m.id === msg.id)) {
                state.messages[msg.conversationId] = [msg, ...existing]
            }
            const conv = state.conversations.find(c => c.id === msg.conversationId)
            if (conv) conv.updatedAt = msg.createdAt
        },

        messageEdited(state, action: PayloadAction<Message>) {
            const msg = action.payload
            const list = state.messages[msg.conversationId] ?? []
            const idx = list.findIndex(m => m.id === msg.id)
            if (idx !== -1) list[idx] = msg
        },

        messageDeleted(state, action: PayloadAction<{ messageId: string; conversationId: string }>) {
            const { messageId, conversationId } = action.payload
            const list = state.messages[conversationId] ?? []
            const idx = list.findIndex(m => m.id === messageId)
            if (idx !== -1) {
                list[idx] = { ...list[idx], isDeleted: true, content: null }
            }
        },

        reactionAdded(state, action: PayloadAction<{ messageId: string; conversationId: string; userId: string; emoji: string }>) {
            const { messageId, conversationId, userId, emoji } = action.payload
            const list = state.messages[conversationId] ?? []
            const msg = list.find(m => m.id === messageId)
            if (msg) {
                msg.reactions.push({ id: `${messageId}-${userId}-${emoji}`, messageId, userId, emoji, user: { id: userId } })
            }
        },

        reactionRemoved(state, action: PayloadAction<{ messageId: string; conversationId: string; userId: string; emoji: string }>) {
            const { messageId, conversationId, userId, emoji } = action.payload
            const list = state.messages[conversationId] ?? []
            const msg = list.find(m => m.id === messageId)
            if (msg) {
                msg.reactions = msg.reactions.filter(r => !(r.userId === userId && r.emoji === emoji))
            }
        },

        userOnline(state, action: PayloadAction<string>) {
            if (!state.onlineUsers.includes(action.payload)) {
                state.onlineUsers.push(action.payload)
            }
        },

        userOffline(state, action: PayloadAction<string>) {
            state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload)
        },

        typingStarted(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
            const { conversationId, userId } = action.payload
            const list = state.typingUsers[conversationId] ?? []
            if (!list.includes(userId)) {
                state.typingUsers[conversationId] = [...list, userId]
            }
        },

        typingStopped(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
            const { conversationId, userId } = action.payload
            state.typingUsers[conversationId] = (state.typingUsers[conversationId] ?? [])
                .filter(id => id !== userId)
        },
    },
})

export const chatActions = chatSlice.actions
export default chatSlice.reducer