import { DmWindow } from './dm/DmWindow'
import { InboxWindow } from './inbox/InboxWindow'
import type {
    Conversation,
    Message, UploadedFile
} from '@entities/chat'
import { useTranslation } from '@shared/lib'

interface ChatWindowProps {
    activeConversation: Conversation | null
    activeConversationId: string | null
    messages: Message[]
    currentUserId: string | null
    currentUserRole: string | null
    subSchoolId: string
    isLoadingMessages: boolean
    messageText: string
    onMessageChange: (text: string) => void
    onSend: (attachments?: UploadedFile[]) => void
}

const STAFF_ROLES = ['admin', 'director', 'super_admin']

export function ChatWindow({
                               activeConversation,
                               activeConversationId,
                               messages,
                               currentUserId,
                               currentUserRole,
                               isLoadingMessages,
                               subSchoolId,
                               messageText,
                               onMessageChange,
                               onSend,
                           }: ChatWindowProps) {
    const { t } = useTranslation()
    if (!activeConversation) {
        return (
            <div className="flex flex-1 items-center justify-center bg-card">
                <p className="text-sm text-muted-foreground">{t('dashboard.chat.selectConversation')}</p>
            </div>
        )
    }

    const isReadOnly = activeConversation.type === 'announcement'
        && !STAFF_ROLES.includes(currentUserRole ?? '')

    if (activeConversation.type === 'dm') {
        return (
            <DmWindow
                activeConversation={activeConversation}
                activeConversationId={activeConversation.id}
                messages={messages}
                currentUserId={currentUserId}
                subSchoolId={subSchoolId}
                isLoadingMessages={isLoadingMessages}
                messageText={messageText}
                onMessageChange={onMessageChange}
                onSend={onSend}
            />
        )
    }

    return (
        <InboxWindow
            activeConversation={activeConversation}
            activeConversationId={activeConversationId}
            messages={messages}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            isLoadingMessages={isLoadingMessages}
            messageText={messageText}
            onMessageChange={onMessageChange}
            onSend={onSend}
            readOnly={isReadOnly}
        />
    )
}