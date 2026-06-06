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

interface DeleteProps  {
    isLoading: boolean
    isOpen?: boolean
    onOpenChange: (open: boolean) => void
    onClick: () => void
}

export const DeleteAlert: React.FC<DeleteProps> = ({isOpen,onClick, isLoading, onOpenChange}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant={'destructive'} onClick={onClick}>
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>}
                        Continue
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};





