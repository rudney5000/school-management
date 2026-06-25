import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {gradeApi, type BulkCreateGradesDto} from "@entities/grades";

export const useBulkCreateGrades = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: BulkCreateGradesDto) =>
            gradeApi.bulkCreate(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] })
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
