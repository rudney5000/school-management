import {
    useState,
    useEffect,
    useCallback
} from 'react'
import { chatApi } from '@entities/chat/api/chat.api'
import { handleApiError } from '@shared/lib'
import type { Message } from '@entities/chat'
import type {SendMessageInput} from "@entities/chat/model/createConversationSchema";

export function useThreadReplies(conversationId: string, threadId: string | null) {
    const [replies, setReplies] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!threadId) return
        setIsLoading(true)
        chatApi.getThreadReplies(conversationId, threadId)
            .then(res => {
                if (res.IsSuccess) setReplies(res.result as Message[])
            })
            .catch(handleApiError)
            .finally(() => setIsLoading(false))
    }, [conversationId, threadId])

    const replyToThread = useCallback(async (input: SendMessageInput) => {
        if (!threadId) return
        try {
            const res = await chatApi.replyToThread(conversationId, threadId, input)
            if (res.IsSuccess) {
                setReplies(prev => [...prev, res.result as Message])
            }
        } catch (err) {
            handleApiError(err as Error)
        }
    }, [conversationId, threadId])

    return { replies, isLoading, replyToThread }
}