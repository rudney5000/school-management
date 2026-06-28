import { useQuery } from '@tanstack/react-query'
import { chatActions } from '../model/slice'
import { chatApi } from '@entities/chat'
import { useEffect } from 'react'
import {useAppDispatch} from "@shared/store/hooks";

export function useMessages(conversationId: string | null) {
    const dispatch = useAppDispatch()

    const query = useQuery({
        queryKey: ['messages', conversationId],
        enabled: !!conversationId,
        queryFn: async () => {
            const res = await chatApi.getMessages(conversationId!, { limit: 50 })
            if (!res.IsSuccess) throw new Error('Erreur chargement messages')
            return res.result
        },
    })

    useEffect(() => {
        if (query.data && conversationId) {
            dispatch(chatActions.setMessages({ conversationId, messages: query.data }))
        }
    }, [query.data, conversationId, dispatch])

    return query
}