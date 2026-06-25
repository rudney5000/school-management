import React from 'react'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";
import {
    type Exam,
    useDeleteExam
} from "@entities/exams";

type Props = {
    exam: Exam
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteExamAlert: React.FC<Props> = ({
                                                       exam,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteExam()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: exam.id, subSchoolId: subSchoolId!}, {
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