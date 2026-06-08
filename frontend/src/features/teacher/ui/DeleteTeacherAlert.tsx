import React from 'react'
import {type Teacher, useDeleteTeacher} from '@entities/teacher'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";

type Props = {
    teacher: Teacher
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteTeacherAlert: React.FC<Props> = ({
                                                        teacher,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteTeacher()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: teacher.id, subSchoolId: subSchoolId!}, {
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