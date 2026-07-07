import { CommonError } from "@shared/helperClass/CommonError";
import { selectUserId } from "@features/auth/model/selectors";
import { useSelector } from "react-redux";
import { useVideoCallSession } from "@entities/video-call/lib/useVideoCallSession";

export function useCallSession(sessionId: string) {
    const currentUserId = useSelector(selectUserId);
    const { data: session } = useVideoCallSession(sessionId);

    const sessionData = session && !session.IsFail && !(session.result instanceof CommonError)
        ? session.result
        : null;

    const isHost = !!sessionData && !!currentUserId && sessionData.initiatedBy === currentUserId;
    const conversationId = sessionData?.conversationId ?? null;

    return { sessionData, isHost, conversationId, currentUserId };
}