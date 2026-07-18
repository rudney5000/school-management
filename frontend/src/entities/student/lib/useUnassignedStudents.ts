import { studentApi } from "@entities/student/api/student.api";
import {useQuery} from "@tanstack/react-query";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {Student} from "@entities/student";

export const useUnassignedStudents = (subSchoolId?: string) => {
    return useQuery<Student[], Error>({
        queryKey: ['students', 'unassigned', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async () => {
            const response = await studentApi.getUnassigned(subSchoolId!)
            if (!response.IsSuccess) throw new Error((response.result as CommonError).Message)
            return response.result as Student[]
        },
    })
}