import {
    useDispatch,
    useSelector
} from 'react-redux';
import { useState } from 'react';
import { PreCallScreen } from './PreCallScreen';
import { CallControls } from './CallControls';
import { ParticipantTile } from './ParticipantTile';
import { useLiveKitRoom } from '@shared/lib/livekit/useLiveKitRoom.ts';
import {
    resetCallUi,
    selectIsCameraOff,
    selectIsMuted,
    setActiveSessionId,
    useJoinVideoCall
} from '@entities/video-call';
import {CommonError} from "@shared/helperClass/CommonError";

type VideoCallWindowProps = {
    sessionId: string;
    onClose: () => void;
};

export function VideoCallWindow({ sessionId, onClose }: VideoCallWindowProps) {
    const dispatch = useDispatch();
    const isMuted = useSelector(selectIsMuted);
    const isCameraOff = useSelector(selectIsCameraOff);

    const [hasJoined, setHasJoined] = useState(false);
    const [credentials, setCredentials] = useState<{ token: string; serverUrl: string } | null>(null);

    const joinMutation = useJoinVideoCall();

    const { participants, isConnected, toggleMute, toggleCamera, disconnect } = useLiveKitRoom(
        credentials?.token ?? null,
        credentials?.serverUrl ?? null,
    );

    const handleJoin = () => {
        joinMutation.mutate(sessionId, {
            onSuccess: (response) => {
                if (response.IsFail || response.result instanceof CommonError) {
                    return;
                }

                const { token, serverUrl } = response.result;
                setCredentials({ token, serverUrl });
                dispatch(setActiveSessionId(sessionId));
                setHasJoined(true);
            },
        });
    };

    const handleHangUp = () => {
        disconnect();
        dispatch(resetCallUi(undefined));
        onClose();
    };

    if (!hasJoined) {
        return <PreCallScreen onJoin={handleJoin} isJoining={joinMutation.isPending} />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 p-4 overflow-y-auto">
                {participants.map((participant) => (
                    <ParticipantTile
                        key={participant.identity}
                        name={participant.name}
                        videoTrack={participant.videoTrack}
                        audioTrack={participant.audioTrack}
                        isLocal={participant.isLocal}
                    />
                ))}
                {!isConnected && (
                    <div className="col-span-full text-center text-sm text-neutral-500">
                        Connexion en cours...
                    </div>
                )}
            </div>

            <CallControls
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
                onHangUp={handleHangUp}
            />
        </div>
    );
}