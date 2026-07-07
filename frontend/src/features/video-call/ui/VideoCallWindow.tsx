import {
    useEffect,
    useMemo,
    useState
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import {X} from "lucide-react";
import {
    useAppSelector
} from "@shared/store/hooks";
import {Button} from "@shared/ui";
import { PreCallScreen } from './PreCallScreen';
import { CallControls } from './CallControls';
import { ParticipantTile } from './ParticipantTile';
import { useLiveKitRoom } from '@shared/lib/livekit/useLiveKitRoom';
import {
    resetCallUi,
    selectIsCameraOff,
    selectIsMuted,
    setActiveSessionId,
    useEndVideoCall,
    useJoinVideoCall,
    useLeaveVideoCall
} from '@entities/video-call';
import {CommonError} from "@shared/helperClass/CommonError";
import {
    useVideoCallSession
} from "@entities/video-call/lib/useVideoCallSession";
import {selectUserId} from "@features/auth/model/selectors";
import {MessageList} from "@/pages/chat/ui/MessageList";
import {
    type Message,
    selectConversations,
    selectMessagesByConversation,
    useChatActions,
    useMessages,
    useSocket
} from "@entities/chat";

type VideoCallWindowProps = {
    sessionId: string;
    onClose: () => void;
};

const EMPTY_MESSAGES: Message[] = [];

export function VideoCallWindow({ sessionId, onClose }: VideoCallWindowProps) {
    const dispatch = useDispatch();
    const isMuted = useSelector(selectIsMuted);
    const isCameraOff = useSelector(selectIsCameraOff);
    const currentUserId = useSelector(selectUserId);

    const [hasJoined, setHasJoined] = useState(false);
    const [credentials, setCredentials] = useState<{ token: string; serverUrl: string } | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [chatMessageText, setChatMessageText] = useState('');

    const joinMutation = useJoinVideoCall();
    const leaveMutation = useLeaveVideoCall();
    const endMutation = useEndVideoCall();
    const { data: session } = useVideoCallSession(sessionId);

    const { participants, isConnected, toggleMute, toggleCamera, disconnect } = useLiveKitRoom(
        credentials?.token ?? null,
        credentials?.serverUrl ?? null,
    );

    const sessionData = session && !session.IsFail && !(session.result instanceof CommonError)
        ? session.result
        : null;

    const isHost = !!sessionData && !!currentUserId && sessionData.initiatedBy === currentUserId;

    const conversationId = sessionData?.conversationId ?? null;

    const conversations = useAppSelector(selectConversations);
    const chatConversation = useMemo(
        () => conversations.find(c => c.id === conversationId) ?? null,
        [conversations, conversationId]
    );
    const socketRef = useSocket();
    const chatActionsHook = useChatActions(socketRef);
    const { isLoading: isLoadingChatMessages } = useMessages(conversationId);
    const chatMessages = useAppSelector(
        conversationId
            ? selectMessagesByConversation(conversationId)
            : () => EMPTY_MESSAGES
    );

    useEffect(() => {
        if (conversationId) {
            chatActionsHook.joinConversation(conversationId);
        }
    }, [conversationId, chatActionsHook]);

    const handleSendChatMessage = () => {
        if (!chatMessageText.trim() || !conversationId) return;
        chatActionsHook.sendMessage(conversationId, {
            content: chatMessageText,
            type: 'text',
        });
        setChatMessageText('');
    };

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

    const requestHangUp = () => setShowLeaveConfirm(true);

    const handleHangUp = () => {
        disconnect();

        if (isHost) {
            endMutation.mutate(sessionId);
        } else {
            leaveMutation.mutate(sessionId);
        }

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
                            Connexion en cours...
                        </div>
                    )}
                </div>

                <CallControls
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    onToggleMute={toggleMute}
                    onToggleCamera={toggleCamera}
                    onHangUp={requestHangUp}
                    isHost={isHost}
                    onToggleChat={conversationId ? () => setIsChatOpen(v => !v) : undefined}
                    isChatOpen={isChatOpen}
                />
                {showLeaveConfirm && (
                    <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
                        <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm text-center space-y-4">
                            <p className="text-white text-sm">
                                {isHost
                                    ? "Voulez-vous vraiment terminer ce live pour tous les participants ?"
                                    : "Voulez-vous vraiment quitter ce live ?"}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="ghost" onClick={() => setShowLeaveConfirm(false)}>
                                    Annuler
                                </Button>
                                <Button variant="destructive" onClick={handleHangUp}>
                                    {isHost ? "Terminer" : "Quitter"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isChatOpen && conversationId && (
                <div className="w-80 border-l border-neutral-800 flex flex-col bg-neutral-950">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                        <span className="text-sm font-semibold text-white">Chat</span>
                        <Button variant="ghost" size="icon-sm" onClick={() => setIsChatOpen(false)}>
                            <X className="size-4 text-neutral-400" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-hidden min-h-0">
                        <MessageList
                            activeConversation={chatConversation}
                            messages={chatMessages}
                            currentUserId={currentUserId}
                            isLoading={isLoadingChatMessages}
                        />
                    </div>
                    <div className="p-2 border-t border-neutral-800">
                        <input
                            className="w-full rounded-md bg-neutral-900 text-white text-sm px-3 py-2 outline-none"
                            placeholder="Écrire un message..."
                            value={chatMessageText}
                            onChange={(e) => setChatMessageText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        />
                    </div>
                </div>
            )}

        </div>

    );
}