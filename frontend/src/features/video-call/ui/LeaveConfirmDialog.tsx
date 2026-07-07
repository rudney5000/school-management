import { Button } from '@shared/ui';

type LeaveConfirmDialogProps = {
    isHost: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export function LeaveConfirmDialog({
                                       isHost,
                                       onCancel,
                                       onConfirm
}: LeaveConfirmDialogProps) {
    return (
        <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
            <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm text-center space-y-4">
                <p className="text-white text-sm">
                    {isHost
                        ? "Voulez-vous vraiment terminer ce live pour tous les participants ?"
                        : "Voulez-vous vraiment quitter ce live ?"}
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="ghost" onClick={onCancel}>Annuler</Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {isHost ? "Terminer" : "Quitter"}
                    </Button>
                </div>
            </div>
        </div>
    );
}