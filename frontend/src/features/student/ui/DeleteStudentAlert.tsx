import React from 'react'
import {type Student, useDeleteStudent} from '@entities/student'
import {DeleteAlert} from "@shared/ui";

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

    function onClick() {
        mutate(student.id, {
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