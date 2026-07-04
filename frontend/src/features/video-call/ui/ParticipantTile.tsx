import { useEffect, useRef } from 'react';
import type { Track } from 'livekit-client';
import { MicOff } from 'lucide-react';

type ParticipantTileProps = {
    name: string;
    videoTrack: Track | null;
    audioTrack: Track | null;
    isLocal: boolean;
};

export function ParticipantTile({ name, videoTrack, audioTrack, isLocal }: ParticipantTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (videoRef.current && videoTrack) {
            videoTrack.attach(videoRef.current);
        }
        return () => {
            videoTrack?.detach();
        };
    }, [videoTrack]);

    useEffect(() => {
        if (audioRef.current && audioTrack && !isLocal) {
            audioTrack.attach(audioRef.current);
        }
        return () => {
            audioTrack?.detach();
        };
    }, [audioTrack, isLocal]);

    return (
        <div className="relative rounded-lg overflow-hidden bg-neutral-900 aspect-video">
            {videoTrack ? (
                <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                    {name}
                </div>
            )}

            {!audioTrack && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                    <MicOff className="w-3 h-3 text-white" />
                </div>
            )}

            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                {name} {isLocal && '(vous)'}
            </div>

            {!isLocal && <audio ref={audioRef} autoPlay />}
        </div>
    );
}