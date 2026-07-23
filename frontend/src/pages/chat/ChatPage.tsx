import React from 'react'
import {useChatPage} from "@/pages/chat/lib/useChatPage";
import {useFilteredConversations} from "@/pages/chat/lib/useFilteredConversations";
import {ChatHeader} from "@/pages/chat/ui/ChatHeader";
import {ChatSidebar} from "@/pages/chat/ui/ChatSidebar";
import {ConversationList} from "@/pages/chat/ui/ConversationList";
import {ChatWindow} from "@/pages/chat/ui/ChatWindow";
import {Button} from "@shared/ui";

export function ChatPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const [showConversationList, setShowConversationList] = React.useState(true)

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

    const handleBackToList = () => {
        setShowConversationList(true)
    }

    const handleSelectConversationMobile = (conversationId: string) => {
        handleSelectConversation(conversationId)
        setShowConversationList(false)
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <ChatHeader
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
            />
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col border-r border-zinc-200 bg-white absolute lg:relative z-10 lg:z-0 h-full w-64 lg:w-auto`}>
                    <ChatSidebar
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        counts={counts}
                    />
                </div>

                <div className={`${showConversationList || !activeConversation ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 border-r border-zinc-200 bg-white`}>
                    <ConversationList
                        conversations={filteredConversations}
                        activeConversationId={activeConversationId}
                        onlineUsers={onlineUsers}
                        unreadByConv={unreadByConv}
                        messages={messages}
                        isLoading={isLoadingConversations}
                        onSelect={handleSelectConversationMobile}
                        currentUserId={currentUserId}
                    />
                </div>

                {activeConversation && (
                    <div className={`${!showConversationList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col`}>
                        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-zinc-200 bg-white">
                            <Button
                                onClick={handleBackToList}
                                className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center p-0"
                            >
                                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Button>
                            <span className="font-medium text-zinc-900">
                                {activeConversation.name || 'Conversation'}
                            </span>
                        </div>
                        <ChatWindow
                            activeConversation={activeConversation}
                            activeConversationId={activeConversationId}
                            messages={messages}
                            currentUserId={currentUserId}
                            subSchoolId={activeConversation.subSchoolId}
                            isLoadingMessages={isLoadingMessages}
                            messageText={messageText}
                            onMessageChange={setMessageText}
                            onSend={handleSendMessage}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}