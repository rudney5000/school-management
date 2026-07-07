import { useState } from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import { PreCallScreen } from './PreCallScreen';
import { CallControls } from './CallControls';
import { ParticipantTile } from './ParticipantTile';
import { CallChatPanel } from './CallChatPanel';
import { LeaveConfirmDialog } from './LeaveConfirmDialog';
import { useLiveKitRoom } from '@shared/lib/livekit/useLiveKitRoom';
import { useCallSession } from '@entities/video-call/lib/useCallSession';
import { useCallChat } from '@features/video-call/lib/useCallChat';
import { useTranslation } from '@shared/lib/useTranslation';
import {
    resetCallUi,
    selectIsCameraOff,
    selectIsMuted,
    setActiveSessionId,
    useEndVideoCall,
    useJoinVideoCall,
    useLeaveVideoCall
} from '@entities/video-call';
import { CommonError } from "@shared/helperClass/CommonError";

type VideoCallWindowProps = {
    sessionId: string;
    onClose: () => void;
};

export function VideoCallWindow({ sessionId, onClose }: VideoCallWindowProps) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isMuted = useSelector(selectIsMuted);
    const isCameraOff = useSelector(selectIsCameraOff);

    const [hasJoined, setHasJoined] = useState(false);
    const [credentials, setCredentials] = useState<{ token: string; serverUrl: string } | null>(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const joinMutation = useJoinVideoCall();
    const leaveMutation = useLeaveVideoCall();
    const endMutation = useEndVideoCall();

    const { isHost, conversationId, currentUserId } = useCallSession(sessionId);
    const chat = useCallChat(conversationId);

    const { participants, isConnected, toggleMute, toggleCamera, disconnect } = useLiveKitRoom(
        credentials?.token ?? null,
        credentials?.serverUrl ?? null,
    );

    const handleJoin = () => {
        joinMutation.mutate(sessionId, {
            onSuccess: (response) => {
                if (response.IsFail || response.result instanceof CommonError) return;
                const { token, serverUrl } = response.result;
                setCredentials({ token, serverUrl });
                dispatch(setActiveSessionId(sessionId));
                setHasJoined(true);
            },
        });
    };

    const handleHangUp = () => {
        disconnect();
        (isHost ? endMutation : leaveMutation).mutate(sessionId);
        dispatch(resetCallUi(undefined));
        setShowLeaveConfirm(false);
        onClose();
    };

    if (!hasJoined) {
        return <PreCallScreen onJoin={handleJoin} isJoining={joinMutation.isPending} />;
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-col flex-1 relative">
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
                            {t('dashboard.chat.videoCall.connecting')}
                        </div>
                    )}
                </div>

                <CallControls
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    onToggleMute={toggleMute}
                    onToggleCamera={toggleCamera}
                    onHangUp={() => setShowLeaveConfirm(true)}
                    isHost={isHost}
                    onToggleChat={conversationId ? chat.toggleChat : undefined}
                    isChatOpen={chat.isChatOpen}
                />

                {showLeaveConfirm && (
                    <LeaveConfirmDialog
                        isHost={isHost}
                        onCancel={() => setShowLeaveConfirm(false)}
                        onConfirm={handleHangUp}
                    />
                )}
            </div>

            {chat.isChatOpen && conversationId && (
                <CallChatPanel
                    conversation={chat.chatConversation}
                    messages={chat.chatMessages}
                    currentUserId={currentUserId}
                    isLoading={chat.isLoadingChatMessages}
                    messageText={chat.chatMessageText}
                    onMessageChange={chat.setChatMessageText}
                    onSend={chat.sendChatMessage}
                    onClose={chat.closeChat}
                />
            )}
        </div>
    );
}