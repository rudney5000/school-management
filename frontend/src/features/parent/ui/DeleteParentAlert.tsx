import React from 'react'
import {type Parent, useDeleteParent} from '@entities/parent'
import {DeleteAlert} from "@shared/ui";
import {useParams} from "@tanstack/react-router";

type Props = {
    parent: Parent
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    handleSuccess?: () => void
}

export const DeleteParentAlert: React.FC<Props> = ({
                                                        parent,
                                                        isOpen,
                                                        onOpenChange,
                                                        handleSuccess,
                                                    }) => {
    const { mutate, isPending } = useDeleteParent()

    const { subSchoolId } = useParams({ strict: false })
    function onClick() {
        mutate({id: parent.id, subSchoolId: subSchoolId!}, {
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