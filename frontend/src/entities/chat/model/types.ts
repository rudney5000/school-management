import type { ConversationType, MemberRole, MessageType } from './constants'

export type ChatUser = {
    id: string
    email: string
    role: string
    teacher?: { id: string; firstName: string; lastName: string; image?: string | null } | null
    student?: { id: string; firstName: string; lastName: string; image?: string | null } | null
    worker?:  { id: string; firstName: string; lastName: string } | null
}

export type ConversationMember = {
    id: string
    conversationId: string
    userId: string
    role: MemberRole
    lastReadAt: string | null
    isMuted: boolean
    joinedAt: string
    user: ChatUser
}

export type MessageReaction = {
    id: string
    messageId: string
    userId: string
    emoji: string
    user: Pick<ChatUser, 'id'> & { teacher?: { firstName: string } | null; student?: { firstName: string } | null }
}

export type Message = {
    id: string
    conversationId: string
    senderId: string
    type: MessageType
    content: string | null
    replyToId: string | null
    replyTo?: { id: string; content: string | null; senderId: string } | null
    isDeleted: boolean
    isEdited: boolean
    deletedAt: string | null
    editedAt: string | null
    createdAt: string
    sender: ChatUser
    reactions: MessageReaction[]
}

export type Conversation = {
    id: string
    type: ConversationType
    name: string | null
    description: string | null
    avatar: string | null
    classId: string | null
    courseId: string | null
    subSchoolId: string
    createdBy: string
    createdAt: string
    updatedAt: string
    members: ConversationMember[]
}