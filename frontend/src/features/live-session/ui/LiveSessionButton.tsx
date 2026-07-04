import { Button } from '@shared/ui/button';
import {
    Video,
    Radio
} from 'lucide-react';
import {
    useCreateLiveSession,
    useStartLiveSession,
    type LiveSession
} from '@entities/liveSession';
import type {
    CreateLiveSessionDto
} from '@entities/liveSession';

type LiveSessionButtonProps = {
    subSchoolId: string;
    isTeacher: boolean;
    existingSession: LiveSession | null | undefined;
    linkPayload: CreateLiveSessionDto;
    onOpenSession: (sessionId: string) => void;
};

export function LiveSessionButton({
                                      subSchoolId,
                                      isTeacher,
                                      existingSession,
                                      linkPayload,
                                      onOpenSession,
                                  }: LiveSessionButtonProps) {
    const createMutation = useCreateLiveSession(subSchoolId);
    const startMutation = useStartLiveSession(subSchoolId);

    const handleStart = () => {
        if (!existingSession) {
            createMutation.mutate(linkPayload, {
                onSuccess: (session) => {
                    startMutation.mutate(session.id, {
                        onSuccess: () => onOpenSession(session.id),
                    });
                },
            });
            return;
        }

        startMutation.mutate(existingSession.id, {
            onSuccess: () => onOpenSession(existingSession.id),
        });
    };

    const handleJoin = () => {
        if (existingSession) onOpenSession(existingSession.id);
    };

    if (existingSession?.status === 'live') {
        return (
            <Button variant="destructive" onClick={handleJoin} className="gap-2">
                <Radio className="w-4 h-4 animate-pulse" />
                {isTeacher ? 'Voir mon live' : 'Rejoindre le live'}
            </Button>
        );
    }

    if (isTeacher) {
        return (
            <Button onClick={handleStart} disabled={createMutation.isPending || startMutation.isPending} className="gap-2">
                <Video className="w-4 h-4" />
                {existingSession ? 'Démarrer le live' : 'Créer un live'}
            </Button>
        );
    }

    if (existingSession?.status === 'scheduled') {
        return (
            <Button variant="secondary" disabled className="gap-2">
                <Video className="w-4 h-4" />
                Live à venir
            </Button>
        );
    }

    return null;
}