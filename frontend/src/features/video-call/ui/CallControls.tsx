import { Button } from '@shared/ui/button';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MessageSquare
} from 'lucide-react';
import { useTranslation } from '@shared/lib/useTranslation';

type CallControlsProps = {
    isMuted: boolean;
    isCameraOff: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onHangUp: () => void;
    isHost?: boolean;
    onToggleChat?: () => void;
    isChatOpen?: boolean;
};

export function CallControls({
                                 isMuted,
                                 isCameraOff,
                                 onToggleMute,
                                 onToggleCamera,
                                 onHangUp,
                                 isHost,
                                 onToggleChat,
                                 isChatOpen
}: CallControlsProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center gap-3 p-4">
            <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" onClick={onToggleMute}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button variant={isCameraOff ? 'destructive' : 'secondary'} size="icon" onClick={onToggleCamera}>
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            {onToggleChat && (
                <Button variant={isChatOpen ? 'default' : 'secondary'} size="icon" onClick={onToggleChat}>
                    <MessageSquare className="w-4 h-4" />
                </Button>
            )}
            <Button variant="destructive" size="icon" onClick={onHangUp}>
                <PhoneOff className="w-4 h-4" />
            </Button>
            {isHost && (
                <span className="text-xs text-neutral-400 ml-2 select-none">
                    {t('dashboard.chat.videoCall.host')}
                </span>
            )}
        </div>
    );
}