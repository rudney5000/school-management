import {useChatPage} from "@/pages/chat/lib/useChatPage";
import {useFilteredConversations} from "@/pages/chat/lib/useFilteredConversations";
import {ChatHeader} from "@/pages/chat/ui/ChatHeader";
import {ChatSidebar} from "@/pages/chat/ui/ChatSidebar";
import {ConversationList} from "@/pages/chat/ui/ConversationList";
import {ChatWindow} from "@/pages/chat/ui/ChatWindow";

export function ChatPage() {
    const {
        selectedCategory,
        setSelectedCategory,
        messageText,
        setMessageText,
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        onlineUsers,
        currentUserId,
        unreadByConv,
        counts,
        isLoadingConversations,
        isLoadingMessages,
        handleSendMessage,
        handleSelectConversation,
    } = useChatPage()

    const filteredConversations = useFilteredConversations(
        conversations,
        selectedCategory,
        unreadByConv
    )

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <ChatHeader />
            <div className="flex flex-1 overflow-hidden">
                <ChatSidebar
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    counts={counts}
                />
                <ConversationList
                    conversations={filteredConversations}
                    activeConversationId={activeConversationId}
                    onlineUsers={onlineUsers}
                    unreadByConv={unreadByConv}
                    messages={messages}
                    isLoading={isLoadingConversations}
                    onSelect={handleSelectConversation}
                />
                <ChatWindow
                    activeConversation={activeConversation}
                    activeConversationId={activeConversationId}
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoadingMessages={isLoadingMessages}
                    messageText={messageText}
                    onMessageChange={setMessageText}
                    onSend={handleSendMessage}
                />
            </div>
        </div>
    )
}