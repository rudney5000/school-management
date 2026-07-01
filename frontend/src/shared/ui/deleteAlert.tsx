import React from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Icons
} from "@/shared/ui/"
import { useTranslation } from "@shared/lib";

interface DeleteProps {
    isLoading: boolean
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    onClick: () => void
}

export const DeleteAlert: React.FC<DeleteProps> = ({
                                                       isOpen,
                                                       onClick,
                                                       isLoading,
                                                       onOpenChange
}) => {
    const { t } = useTranslation()

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('dashboard.common.deleteAlert.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('dashboard.common.deleteAlert.description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('dashboard.common.cancel')}</AlertDialogCancel>
                    <Button variant="destructive" onClick={onClick}>
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dashboard.common.confirm')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}