import {
    useState,
    useEffect,
    useMemo
} from 'react'
import {
    useAppDispatch,
    useAppSelector
} from '@shared/store/hooks'
import { shallowEqual } from 'react-redux'
import type { RootState } from '@shared/store'
import {
    selectConversations,
    selectActiveConversation,
    selectMessagesByConversation,
    selectOnlineUsers,
    selectUnreadCountByConversation,
    chatActions,
    type Message,
} from '@entities/chat'
import { useConversations } from '@entities/chat'
import { useMessages } from '@entities/chat'
import { useSocket } from '@entities/chat'
import { useChatActions } from '@entities/chat'
import { selectUserId } from '@features/auth/model/selectors'

export function useChatPage() {
    const dispatch = useAppDispatch()
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [messageText, setMessageText] = useState('')

    const { isLoading: isLoadingConversations } = useConversations()
    const conversations = useAppSelector(selectConversations, shallowEqual)
    const activeConversation = useAppSelector(selectActiveConversation)
    const activeConversationId = useAppSelector((state) => state.chat.activeConversationId)
    const currentUserId = useAppSelector(selectUserId)
    const onlineUsers = useAppSelector(selectOnlineUsers, shallowEqual)

    const messages = useAppSelector(
        activeConversationId
            ? selectMessagesByConversation(activeConversationId)
            : () => [] as Message[],
        shallowEqual
    )

    const unreadByConv = useAppSelector((state: RootState) => {
        if (!currentUserId) return {} as Record<string, number>
        return selectUnreadCountByConversation(currentUserId)(state)
    }, shallowEqual)

    const counts = useMemo(() => ({
        all:      conversations.length,
        groups:   conversations.filter(c => c.type === 'group' || c.type === 'class' || c.type === 'course').length,
        direct:   conversations.filter(c => c.type === 'dm').length,
        unread:   Object.values(unreadByConv).reduce((a, b) => a + b, 0),
        starred:  0,
        archived: 0,
    }), [conversations, unreadByConv])

    const { isLoading: isLoadingMessages } = useMessages(activeConversationId)
    const socketRef = useSocket()
    const chatActionsHook = useChatActions(socketRef)

    useEffect(() => {
        if (conversations.length > 0 && !activeConversationId) {
            const first = conversations.find(c => c.type === 'course' || c.type === 'class' || c.type === 'dm')
                ?? conversations[0]
            dispatch(chatActions.setActiveConversation(first.id))
        }
    }, [conversations, activeConversationId, dispatch])

    useEffect(() => {
        if (activeConversationId) {
            chatActionsHook.joinConversation(activeConversationId)
        }
    }, [activeConversationId, chatActionsHook])

    const handleSendMessage = () => {
        if (!messageText.trim() || !activeConversationId) return
        chatActionsHook.sendMessage(activeConversationId, { content: messageText, type: 'text' })
        setMessageText('')
    }

    const handleSelectConversation = (id: string) => {
        dispatch(chatActions.setActiveConversation(id))
    }

    return {
        selectedCategory,
        setSelectedCategory,
        messageText,
        setMessageText,
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        onlineUsers,
        currentUserId,
        unreadByConv,
        counts,
        isLoadingConversations,
        isLoadingMessages,
        chatActionsHook,
        handleSendMessage,
        handleSelectConversation,
    }
}