import { useQuery } from '@tanstack/react-query'
import { chatActions } from '../model/slice'
import { chatApi } from '@entities/chat'
import { useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import {useAppDispatch} from "@shared/store/hooks";

export function useConversations() {
    const dispatch = useAppDispatch()
    const { subSchoolId } = useParams({ strict: false })

    const query = useQuery({
        queryKey: ['conversations', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async () => {
            const res = await chatApi.getConversations(subSchoolId!)
            if (!res.IsSuccess) throw new Error('Erreur chargement conversations')
            return res.result
        },
    })

    useEffect(() => {
        if (query.data) dispatch(chatActions.setConversations(query.data))
    }, [query.data, dispatch])

    return query
}