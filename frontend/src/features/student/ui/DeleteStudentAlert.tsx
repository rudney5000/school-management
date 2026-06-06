import React from 'react'
import {type Student, useDeleteStudent} from '@entities/student'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";

type Props = {
    student: Student
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteStudentAlert: React.FC<Props> = ({
                                                        student,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteStudent()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: student.id, subSchoolId: subSchoolId!}, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <DeleteAlert
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClick={onClick}
            isLoading={isPending}
        />
    )
}