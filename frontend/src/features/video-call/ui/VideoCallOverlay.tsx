import { useDispatch, useSelector } from 'react-redux'
import { resetCallUi, selectActiveSessionId } from '@entities/video-call'
import {VideoCallWindow} from "@features/video-call/ui/VideoCallWindow";

export function VideoCallOverlay() {
    const dispatch = useDispatch()
    const activeSessionId = useSelector(selectActiveSessionId)

    if (!activeSessionId) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="w-full h-full max-w-6xl max-h-[90vh] bg-neutral-950 rounded-xl overflow-hidden">
                <VideoCallWindow
                    sessionId={activeSessionId}
                    onClose={() => dispatch(resetCallUi(undefined))}
                />
            </div>
        </div>
    )
}