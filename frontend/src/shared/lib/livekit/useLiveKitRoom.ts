import {
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react';
import {
    Room,
    RoomEvent,
    Track,
    type RemoteParticipant
} from 'livekit-client';
import { useDispatch } from 'react-redux';
import {
    setCameraOff,
    setMuted
} from "@entities/video-call";

type ParticipantEntry = {
    identity: string;
    name: string;
    isLocal: boolean;
    videoTrack: Track | null;
    audioTrack: Track | null;
};

export function useLiveKitRoom(token: string | null, serverUrl: string | null) {
    const dispatch = useDispatch();
    const roomRef = useRef<Room | null>(null);
    const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const syncParticipants = useCallback((room: Room) => {
        const all: ParticipantEntry[] = [];

        const localParticipant = room.localParticipant;
        all.push({
            identity: localParticipant.identity,
            name: localParticipant.name ?? localParticipant.identity,
            isLocal: true,
            videoTrack: localParticipant.getTrackPublication(Track.Source.Camera)?.track ?? null,
            audioTrack: localParticipant.getTrackPublication(Track.Source.Microphone)?.track ?? null,
        });

        room.remoteParticipants.forEach((participant: RemoteParticipant) => {
            all.push({
                identity: participant.identity,
                name: participant.name ?? participant.identity,
                isLocal: false,
                videoTrack: participant.getTrackPublication(Track.Source.Camera)?.track ?? null,
                audioTrack: participant.getTrackPublication(Track.Source.Microphone)?.track ?? null,
            });
        });

        setParticipants(all);
    }, []);

    useEffect(() => {
        if (!token || !serverUrl) return;

        const room = new Room();
        roomRef.current = room;
        setIsConnecting(true);

        const handleUpdate = () => syncParticipants(room);

        room
            .on(RoomEvent.ParticipantConnected, handleUpdate)
            .on(RoomEvent.ParticipantDisconnected, handleUpdate)
            .on(RoomEvent.TrackSubscribed, handleUpdate)
            .on(RoomEvent.TrackUnsubscribed, handleUpdate)
            .on(RoomEvent.LocalTrackPublished, handleUpdate)
            .on(RoomEvent.LocalTrackUnpublished, handleUpdate)
            .on(RoomEvent.Disconnected, () => {
                setIsConnected(false);
            });

        room
            .connect(serverUrl, token)
            .then(async () => {
                await room.localParticipant.enableCameraAndMicrophone();
                setIsConnected(true);
                syncParticipants(room);
            })
            .catch((err: Error) => {
                setError(err);
            })
            .finally(() => {
                setIsConnecting(false);
            });

        return () => {
            room.disconnect();
            roomRef.current = null;
        };
    }, [token, serverUrl, syncParticipants]);

    const toggleMute = useCallback(async () => {
        const room = roomRef.current;
        if (!room) return;

        const enabled = room.localParticipant.isMicrophoneEnabled;
        await room.localParticipant.setMicrophoneEnabled(!enabled);
        dispatch(setMuted(enabled));
    }, [dispatch]);

    const toggleCamera = useCallback(async () => {
        const room = roomRef.current;
        if (!room) return;

        const enabled = room.localParticipant.isCameraEnabled;
        await room.localParticipant.setCameraEnabled(!enabled);
        dispatch(setCameraOff(enabled));
    }, [dispatch]);

    const disconnect = useCallback(() => {
        roomRef.current?.disconnect();
    }, []);

    return {
        participants,
        isConnected,
        isConnecting,
        error,
        toggleMute,
        toggleCamera,
        disconnect,
    };
}