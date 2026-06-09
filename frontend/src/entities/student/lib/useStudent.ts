import { studentApi } from "@entities/student/api/student.api";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import type { Student } from "@entities/student";
import { useEffect } from "react";

export const useStudent = (studentId: string, subSchoolId: string) => {
    const query = useQuery<Student, Error>({
        queryKey: ['student', studentId],
        enabled: !!studentId,
        queryFn: async (): Promise<Student> => {
            if (!studentId) throw new Error("Student ID is required");

            const response = await studentApi.getById({ id: studentId, subSchoolId });
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Student;
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};