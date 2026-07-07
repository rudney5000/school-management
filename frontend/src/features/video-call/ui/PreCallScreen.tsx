import {
    useEffect,
    useRef,
    useState
} from 'react';
import { Button } from '@shared/ui/button';
import {
    Mic,
    MicOff,
    Video,
    VideoOff
} from 'lucide-react';
import {
    useMediaDevices
} from '@shared/lib/livekit/useMediaDevices';
import { useTranslation } from '@shared/lib/useTranslation';

type PreCallScreenProps = {
    onJoin: () => void;
    isJoining: boolean;
};

export function PreCallScreen({ onJoin, isJoining }: PreCallScreenProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { previewStream } = useMediaDevices();
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    const { t } = useTranslation();
    useEffect(() => {
        if (videoRef.current && previewStream) {
            videoRef.current.srcObject = previewStream;
        }
    }, [previewStream]);

    useEffect(() => {
        previewStream?.getAudioTracks().forEach((track) => {
            track.enabled = micEnabled;
        });
    }, [micEnabled, previewStream]);

    useEffect(() => {
        previewStream?.getVideoTracks().forEach((track) => {
            track.enabled = cameraEnabled;
        });
    }, [cameraEnabled, previewStream]);

    return (
        <div className="flex flex-col items-center gap-6 p-8">
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-black">
                {cameraEnabled ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        <VideoOff className="w-10 h-10 opacity-60" />
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <Button
                    variant={micEnabled ? 'secondary' : 'destructive'}
                    size="icon"
                    onClick={() => setMicEnabled((prev) => !prev)}
                >
                    {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                    variant={cameraEnabled ? 'secondary' : 'destructive'}
                    size="icon"
                    onClick={() => setCameraEnabled((prev) => !prev)}
                >
                    {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
            </div>
            <Button onClick={onJoin} disabled={isJoining} className="w-full max-w-md">
                {isJoining ? t('dashboard.chat.videoCall.joining') : t('dashboard.chat.videoCall.joinCall')}
            </Button>
        </div>
    );
}