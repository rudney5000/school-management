import { useQuery } from '@tanstack/react-query'
import {
    chatApi,
    type ContactableStaffResponse
} from '@entities/chat'

export function useContactableStaff(studentId?: string) {
    const query = useQuery({
        queryKey: ['contactable-staff', studentId ?? 'all'],
        queryFn: async () => {
            const res = await chatApi.getContactableStaff(studentId)
            if (!res.IsSuccess) throw new Error('Erreur chargement contacts')
            return res.result as ContactableStaffResponse
        },
    })

    return {
        staff: query.data?.staff ?? [],
        teachers: query.data?.teachers ?? [],
        isLoading: query.isLoading,
    }
}