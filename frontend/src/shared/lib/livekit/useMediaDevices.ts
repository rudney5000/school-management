import {
    useEffect,
    useState
} from 'react';
import { Room } from 'livekit-client';

export function useMediaDevices() {
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        Room.getLocalDevices('audioinput').then(setAudioDevices);
        Room.getLocalDevices('videoinput').then(setVideoDevices);
    }, []);

    useEffect(() => {
        let stream: MediaStream;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((s) => {
                stream = s;
                setPreviewStream(s);
            })
            .catch(() => setPreviewStream(null));

        return () => {
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return { audioDevices, videoDevices, previewStream };
}