import { X } from 'lucide-react';
import { Button } from '@shared/ui';
import { MessageList } from '@/pages/chat/ui/MessageList';
import type {
    Conversation,
    Message
} from '@entities/chat';

type CallChatPanelProps = {
    conversation: Conversation | null;
    messages: Message[];
    currentUserId: string | null;
    isLoading: boolean;
    messageText: string;
    onMessageChange: (text: string) => void;
    onSend: () => void;
    onClose: () => void;
};

export function CallChatPanel({
                                  conversation,
                                  messages,
                                  currentUserId,
                                  isLoading,
                                  messageText,
                                  onMessageChange,
                                  onSend,
                                  onClose
}: CallChatPanelProps) {
    return (
        <div className="w-80 border-l border-neutral-800 flex flex-col bg-neutral-950">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-white">Chat</span>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                    <X className="size-4 text-neutral-400" />
                </Button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
                <MessageList
                    activeConversation={conversation}
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoading}
                />
            </div>
            <div className="p-2 border-t border-neutral-800">
                <input
                    className="w-full rounded-md bg-neutral-900 text-white text-sm px-3 py-2 outline-none"
                    placeholder="Écrire un message..."
                    value={messageText}
                    onChange={(e) => onMessageChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSend()}
                />
            </div>
        </div>
    );
}