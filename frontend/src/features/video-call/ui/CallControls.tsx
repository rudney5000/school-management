import { Button } from '@shared/ui/button';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff
} from 'lucide-react';

type CallControlsProps = {
    isMuted: boolean;
    isCameraOff: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onHangUp: () => void;
};

export function CallControls({ isMuted, isCameraOff, onToggleMute, onToggleCamera, onHangUp }: CallControlsProps) {
    return (
        <div className="flex items-center justify-center gap-3 p-4">
            <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" onClick={onToggleMute}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button variant={isCameraOff ? 'destructive' : 'secondary'} size="icon" onClick={onToggleCamera}>
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={onHangUp}>
                <PhoneOff className="w-4 h-4" />
            </Button>
        </div>
    );
}