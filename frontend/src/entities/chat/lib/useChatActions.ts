import {
    useRef,
    useCallback,
    type RefObject
} from 'react'
import {Socket} from "socket.io-client";
import type {
    AddReactionInput,
    EditMessageInput,
    SendMessageInput
} from "@entities/chat/model/createConversationSchema";

export function useChatActions(socketRef: RefObject<Socket | null>) {
    const typingTimeout = useRef<ReturnType<typeof setTimeout>>()

    const joinConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('join_conversation', conversationId)
    }, [socketRef])

    const sendMessage = useCallback((conversationId: string, input: SendMessageInput) => {
        socketRef.current?.emit('message:send', { conversationId, input })
    }, [socketRef])

    const editMessage = useCallback((conversationId: string, messageId: string, input: EditMessageInput) => {
        socketRef.current?.emit('message:edit', { conversationId, messageId, input })
    }, [socketRef])

    const deleteMessage = useCallback((conversationId: string, messageId: string) => {
        socketRef.current?.emit('message:delete', { conversationId, messageId })
    }, [socketRef])

    const markAsRead = useCallback((conversationId: string, messageId: string) => {
        socketRef.current?.emit('message:read', { conversationId, messageId })
    }, [socketRef])

    const addReaction = useCallback((conversationId: string, messageId: string, input: AddReactionInput) => {
        socketRef.current?.emit('reaction:add', { conversationId, messageId, input })
    }, [socketRef])

    const removeReaction = useCallback((conversationId: string, messageId: string, emoji: string) => {
        socketRef.current?.emit('reaction:remove', { conversationId, messageId, emoji })
    }, [socketRef])

    const startTyping = useCallback((conversationId: string) => {
        socketRef.current?.emit('typing:start', conversationId)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit('typing:stop', conversationId)
        }, 3000)
    }, [socketRef])

    const stopTyping = useCallback((conversationId: string) => {
        clearTimeout(typingTimeout.current)
        socketRef.current?.emit('typing:stop', conversationId)
    }, [socketRef])

    return {
        joinConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        markAsRead,
        addReaction,
        removeReaction,
        startTyping,
        stopTyping,
    }
}