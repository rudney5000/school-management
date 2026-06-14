import React from 'react'
import {type Schedule, useDeleteSchedule} from '@entities/schedule'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";

type Props = {
    schedule: Schedule
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteScheduleAlert: React.FC<Props> = ({
                                                         schedule,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteSchedule()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: schedule.id, subSchoolId: subSchoolId!}, {
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