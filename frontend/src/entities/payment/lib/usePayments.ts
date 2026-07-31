import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import {
    paymentApi,
    type Payment
} from '@entities/payment'

export const usePayments = () => {
    const query = useQuery<Payment[], Error>({
        queryKey: ['payments', 'list'],
        queryFn: async (): Promise<Payment[]> => {
            const response = await paymentApi.getAll()

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as Payment[]
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error, query.data])

    return query
}