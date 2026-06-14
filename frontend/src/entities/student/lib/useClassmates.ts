import {studentApi} from "@entities/student";
import {useQuery} from "@tanstack/react-query";

export function useClassmates(
    subSchoolId: string | undefined,
    currentStudentId: string | undefined
) {
    return useQuery({
        queryKey: ['students', 'classmates', subSchoolId],
        queryFn: () => studentApi.getAll({ subSchoolId }),
        enabled: !!subSchoolId,
        select: (response) => {
            if (response.IsFail || !Array.isArray(response.result)) return []
            return response.result
                .filter((s) => s.id !== currentStudentId)
                .map(({ id, firstName, lastName, image }) => ({ id, firstName, lastName, image }))
        },
    })
}