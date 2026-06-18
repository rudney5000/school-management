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
} from "@shared/ui"
import { useTranslation } from "@shared/lib";

interface DeleteAlertEventProps {
    isLoading: boolean
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    onClick: () => void
    eventName?: string
}

export const DeleteAlertEvent: React.FC<DeleteAlertEventProps> = ({ isOpen, onClick, isLoading, onOpenChange, eventName }) => {
    const { t } = useTranslation()

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl border-gray-100">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900">{t('dashboard.common.deleteAlert.title')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-500">
                        {eventName
                            ? `${t('dashboard.common.deleteAlert.description')} "${eventName}"?`
                            : t('dashboard.common.deleteAlert.description')
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{t('dashboard.common.cancel')}</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={onClick}
                        className="rounded-xl"
                        style={{ background: "#DC2626" }}
                    >
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dashboard.common.confirm')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
