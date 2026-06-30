import {
    type RefObject,
    useEffect,
    useRef
} from 'react'
import {
    useAppDispatch,
    useAppSelector
} from "@shared/store/hooks";
import {
    io,
    type Socket
} from "socket.io-client";
import {chatActions} from "@entities/chat";
import {selectAccessToken} from "@features/auth/model/selectors";

let socketInstance: Socket | null = null

export function useSocket(): RefObject<Socket | null> {
    const dispatch = useAppDispatch()
    const token = useAppSelector(selectAccessToken)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!token) return

        if (!socketInstance) {
            socketInstance = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:3000', {
                auth: { token },
                transports: ['websocket'],
            })
        }

        socketRef.current = socketInstance

        const socket = socketInstance

        socket.on('message:new', (msg) => dispatch(chatActions.messageReceived(msg)))
        socket.on('message:edited', (msg) => dispatch(chatActions.messageEdited(msg)))
        socket.on('message:deleted', (data) => dispatch(chatActions.messageDeleted(data)))
        socket.on('reaction:added', (data) => dispatch(chatActions.reactionAdded(data)))
        socket.on('reaction:removed', (data) => dispatch(chatActions.reactionRemoved(data)))
        socket.on('user:online', ({ userId }) => dispatch(chatActions.userOnline(userId)))
        socket.on('user:offline', ({ userId }) => dispatch(chatActions.userOffline(userId)))
        socket.on('user:typing', ({ userId, conversationId, isTyping }) => {
            if (isTyping) dispatch(chatActions.typingStarted({ conversationId, userId }))
            else dispatch(chatActions.typingStopped({ conversationId, userId }))
        })
        socket.on('message:starred', (data) =>
            dispatch(chatActions.messageStarred(data))
        )
        socket.on('message:unstarred', (data) =>
            dispatch(chatActions.messageUnstarred(data))
        )
        socket.on('message:archived', (data) =>
            dispatch(chatActions.messageArchived(data))
        )

        return () => {
            socket.off('message:new')
            socket.off('message:edited')
            socket.off('message:deleted')
            socket.off('reaction:added')
            socket.off('reaction:removed')
            socket.off('user:online')
            socket.off('user:offline')
            socket.off('user:typing')
        }
    }, [token, dispatch])

    return socketRef
}