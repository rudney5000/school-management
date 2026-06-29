import { useMemo } from 'react'
import type { Conversation } from '@entities/chat'

export function useFilteredConversations(
    conversations: Conversation[],
    selectedCategory: string,
    unreadByConv: Record<string, number>,
) {
    return useMemo(() => {
        switch (selectedCategory) {
            case 'groups':
                return conversations.filter(c =>
                    c.type === 'group' || c.type === 'class' || c.type === 'course'
                )
            case 'direct':
                return conversations.filter(c => c.type === 'dm')
            case 'unread':
                return conversations.filter(c => (unreadByConv[c.id] ?? 0) > 0)
            default:
                return conversations
        }
    }, [conversations, selectedCategory, unreadByConv])
}