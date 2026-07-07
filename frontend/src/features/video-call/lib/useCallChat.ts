import {
    useEffect,
    useMemo,
    useState
} from 'react';
import { useAppSelector } from "@shared/store/hooks";
import {
    type Message,
    selectConversations,
    selectMessagesByConversation,
    useChatActions,
    useMessages,
    useSocket
} from "@entities/chat";

const EMPTY_MESSAGES: Message[] = [];

export function useCallChat(conversationId: string | null) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessageText, setChatMessageText] = useState('');

    const conversations = useAppSelector(selectConversations);
    const chatConversation = useMemo(
        () => conversations.find(c => c.id === conversationId) ?? null,
        [conversations, conversationId]
    );

    const socketRef = useSocket();
    const chatActionsHook = useChatActions(socketRef);
    const { isLoading: isLoadingChatMessages } = useMessages(conversationId);
    const chatMessages = useAppSelector(
        conversationId ? selectMessagesByConversation(conversationId) : () => EMPTY_MESSAGES
    );

    useEffect(() => {
        if (conversationId) {
            chatActionsHook.joinConversation(conversationId);
        }
    }, [conversationId, chatActionsHook]);

    const sendChatMessage = () => {
        if (!chatMessageText.trim() || !conversationId) return;
        chatActionsHook.sendMessage(conversationId, { content: chatMessageText, type: 'text' });
        setChatMessageText('');
    };

    return {
        isChatOpen,
        toggleChat: () => setIsChatOpen(v => !v),
        closeChat: () => setIsChatOpen(false),
        chatConversation,
        chatMessages,
        isLoadingChatMessages,
        chatMessageText,
        setChatMessageText,
        sendChatMessage,
    };
}