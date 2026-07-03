import type { Conversation } from '@entities/chat'

export function getConversationDisplayName(
    conversation: Conversation,
    currentUserId: string | null
): string {
    if (conversation.name) return conversation.name

    if (conversation.type === 'dm') {
        const other = conversation.members.find(m => m.userId !== currentUserId)
        return other?.user?.email ?? 'Direct Message'
    }

    return 'Unnamed Chat'
}