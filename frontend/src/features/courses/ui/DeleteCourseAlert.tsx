import React from 'react'
import {type Course, useDeleteCourse} from '@entities/courses'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";

type Props = {
    course: Course
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteCourseAlert: React.FC<Props> = ({
                                                        course,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteCourse()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: course.id, subSchoolId: subSchoolId!}, {
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