import { Button } from '@shared/ui';
import { useTranslation } from '@shared/lib/useTranslation';

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
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
            <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm text-center space-y-4">
                <p className="text-white text-sm">
                    {isHost
                        ? t('dashboard.chat.videoCall.leaveDialog.hostConfirm')
                        : t('dashboard.chat.videoCall.leaveDialog.participantConfirm')}
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="ghost" onClick={onCancel}>{t('dashboard.chat.videoCall.leaveDialog.cancel')}</Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {isHost ? t('dashboard.chat.videoCall.leaveDialog.end') : t('videoCall.leaveDialog.leave')}
                    </Button>
                </div>
            </div>
        </div>
    );
}