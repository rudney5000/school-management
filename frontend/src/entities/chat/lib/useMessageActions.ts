import {
    chatActions,
    chatApi,
    type Message,
    useChatActions,
    useSocket
} from '@entities/chat'
import {useAppDispatch} from "@shared/store/hooks";
import {
    useCallback,
    useState
} from "react";
import {handleApiError} from "@shared/lib";

export function useMessageActions(conversationId: string) {
    const dispatch = useAppDispatch()
    const socketRef = useSocket()
    const {
        starMessage,
        unstarMessage,
        archiveMessage,
        forwardMessage
    } = useChatActions(socketRef)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleStar = useCallback((message: Message) => {
        if (message.isStarred) {
            unstarMessage(conversationId, message.id)
        } else {
            starMessage(conversationId, message.id)
        }
    }, [conversationId, starMessage, unstarMessage])

    const handleArchive = useCallback((message: Message) => {
        archiveMessage(conversationId, message.id)
    }, [conversationId, archiveMessage])

    const handleDelete = useCallback(async (message: Message) => {
        setLoadingId(message.id)
        try {
            await chatApi.deleteMessage(conversationId, message.id)
            dispatch(chatActions.messageDeleted({ messageId: message.id, conversationId }))
        } catch (err) {
            handleApiError(err as Error)
        } finally {
            setLoadingId(null)
        }
    }, [conversationId, dispatch])

    const handleForward = useCallback((message: Message, targetConversationId: string) => {
        forwardMessage(conversationId, message.id, targetConversationId)
    }, [conversationId, forwardMessage])

    return {
        starMessage:    handleStar,
        archiveMessage: handleArchive,
        deleteMessage:  handleDelete,
        forwardMessage: handleForward,
        loadingId,
    }
}