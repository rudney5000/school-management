import {
    useState,
    useEffect,
    useMemo
} from "react"
import {shallowEqual} from "react-redux";
import {
    Inbox,
    Star,
    Send,
    FileText,
    AlertCircle,
    Trash2,
    Plus,
    Search,
    SlidersHorizontal,
    Settings,
    ChevronLeft,
    ChevronRight,
    Download,
    Reply,
    MoreHorizontal,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    List,
    ChevronDown,
    Undo2,
    Redo2,
    Link2,
    Paperclip,
    Smile,
    Image,
    Video,
} from "lucide-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Input,
    ScrollArea,
    Separator
} from "@/shared/ui"
import { cn } from "@/shared/lib/"
import { useAppSelector } from "@shared/store/hooks"
import {
    selectConversations,
    selectActiveConversation,
    selectMessagesByConversation,
    selectOnlineUsers,
    chatActions,
    type Message,
    selectUnreadCountByConversation,
} from "@entities/chat"
import { useConversations } from "@entities/chat"
import { useMessages } from "@entities/chat"
import { useSocket } from "@entities/chat"
import { useChatActions } from "@entities/chat"
import { useAppDispatch } from "@shared/store/hooks"
import { selectUserId } from "@features/auth/model/selectors"
import type {RootState} from "@shared/store";

export function ChatPage() {
    const dispatch = useAppDispatch()
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [messageText, setMessageText] = useState("")
    // const [showReplyTag, setShowReplyTag] = useState(true)

    const { isLoading: isLoadingConversations } = useConversations()
    const conversations = useAppSelector(selectConversations, shallowEqual)
    const activeConversation = useAppSelector(selectActiveConversation)
    const activeConversationId = useAppSelector((state) => state.chat.activeConversationId)
    const messages = useAppSelector(
        activeConversationId
            ? selectMessagesByConversation(activeConversationId)
            : () => [] as Message[],
        shallowEqual
    )
    const onlineUsers = useAppSelector(selectOnlineUsers, shallowEqual)
    const currentUserId = useAppSelector(selectUserId)

    const unreadByConv = useAppSelector((state: RootState) => {
        if (!currentUserId) return {} as Record<string, number>
        return selectUnreadCountByConversation(currentUserId)(state)
    }, shallowEqual)

    const counts = useMemo(() => ({
        all:      conversations.length,
        groups:   conversations.filter(c => c.type === 'group' || c.type === 'class' || c.type === 'course').length,
        direct:   conversations.filter(c => c.type === 'dm').length,
        unread:   0,
        starred:  0,
        archived: 0,
    }), [conversations])

    const totalUnread = useMemo(
        () => Object.values(unreadByConv).reduce((a, b) => a + b, 0),
        [unreadByConv]
    )

    const avatarColors: Record<number, string> = {
        1: "bg-amber-200 text-amber-800",
        3: "bg-teal-200 text-teal-800",
        5: "bg-rose-200 text-rose-800",
    }

    const labels = [
        { id: "academic", label: "Academic", color: "bg-pink-400", count: 3 },
        { id: "events", label: "Events", color: "bg-slate-800", count: 2 },
        { id: "finance", label: "Finance", color: "bg-cyan-400", count: 1 },
        { id: "administration", label: "Administration", color: "bg-slate-400", count: 2 },
    ]

    const categories = [
        { id: "all",     label: "All Chats",        icon: Inbox,      count: counts.all },
        { id: "starred", label: "Starred",           icon: Star,       count: counts.starred },
        { id: "unread",  label: "Unread",            icon: Send,       count: totalUnread },
        { id: "groups",  label: "Groups",            icon: FileText,   count: counts.groups },
        { id: "direct",  label: "Direct Messages",   icon: AlertCircle, count: counts.direct },
        { id: "archived", label: "Archived",         icon: Trash2,     count: counts.archived },
    ]

    const filteredConversations = useMemo(() => {
        switch (selectedCategory) {
            case 'groups':
                return conversations.filter(c => c.type === 'group' || c.type === 'class' || c.type === 'course')
            case 'direct':
                return conversations.filter(c => c.type === 'dm')
            case 'unread':
                return conversations.filter(c => (unreadByConv[c.id] ?? 0) > 0)
            default:
                return conversations
        }
    }, [conversations, selectedCategory, unreadByConv])

    const { isLoading: isLoadingMessages } = useMessages(activeConversationId)

    const socketRef = useSocket()
    const chatActionsHook = useChatActions(socketRef)

    useEffect(() => {
        if (conversations.length > 0 && !activeConversationId) {
            dispatch(chatActions.setActiveConversation(conversations[0].id))
        }
    }, [conversations, activeConversationId, dispatch])

    useEffect(() => {
        if (activeConversationId) {
            chatActionsHook.joinConversation(activeConversationId)
        }
    }, [activeConversationId, chatActionsHook])

    const handleSendMessage = () => {
        if (!messageText.trim() || !activeConversationId) return
        chatActionsHook.sendMessage(activeConversationId, { content: messageText, type: 'text' })
        setMessageText("")
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex w-72 items-center">
                        <Search className="absolute left-3 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search anything"
                            className="rounded-full pl-9 pr-4 text-sm bg-muted/50 border-transparent focus:border-border"
                        />
                        <Button variant="ghost" size="icon-sm" className="absolute right-2 text-muted-foreground">
                            <SlidersHorizontal className="size-4" />
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-border text-muted-foreground hover:text-foreground"
                    >
                        <Settings className="size-4" />
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-card px-3 py-5">
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Category
                    </p>
                    <nav className="flex flex-col gap-0.5">
                        {categories.map(({ id, label, icon: Icon, count }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedCategory(id)}
                                className={cn(
                                    "flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
                                    selectedCategory === id
                                        ? "bg-accent font-semibold text-primary"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                  <Icon className="size-4" />
                                    {label}
                                </span>
                                {count !== null && (
                                    <Badge
                                        variant={selectedCategory === id ? "default" : "secondary"}
                                        className="text-xs px-1.5 py-0.5"
                                    >
                                        {count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </nav>

                    <Separator className="my-4" />

                    <div className="mb-2 flex items-center justify-between px-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Label
                        </p>
                        <button className="text-muted-foreground hover:text-foreground">
                            <Plus className="size-3.5" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-0.5">
                        {labels.map(({ id, label, color, count }) => (
                            <button
                                key={id}
                                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                            >
                                <span className="flex items-center gap-2">
                                  <span className={cn("size-2.5 rounded-full", color)} />
                                    {label}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                    {count}
                                </Badge>
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex w-80 shrink-0 flex-col border-r border-border bg-background">
                    <div className="flex items-center gap-2 p-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search email"
                                className="rounded-full pl-9 text-sm bg-card border-border"
                            />
                        </div>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <SlidersHorizontal className="size-4" />
                        </Button>
                        <Button size="icon-sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                            <Plus className="size-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-0.5 p-2">
                            {filteredConversations.map((conversation) => {
                                const lastMessage = messages.find(m => m.conversationId === conversation.id)
                                const isOnline = conversation.members.some(m => onlineUsers.includes(m.userId))
                                const initials = conversation.name
                                    ? conversation.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                    : '??'
                                const unread = unreadByConv[conversation.id] ?? 0

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => dispatch(chatActions.setActiveConversation(conversation.id))}
                                        className={cn(
                                            "flex items-start gap-3 rounded-xl p-3 text-left transition-colors",
                                            activeConversationId === conversation.id
                                                ? "bg-accent"
                                                : "hover:bg-muted/60"
                                        )}
                                    >
                                        {unread > 0 && (
                                            <Badge className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px]">
                                                {unread}
                                            </Badge>
                                        )}
                                        <div className="relative mt-0.5 shrink-0">
                                            <Avatar>
                                                {conversation.avatar ? (
                                                    <AvatarImage src={conversation.avatar} alt={conversation.name || 'Chat'} />
                                                ) : null}
                                                <AvatarFallback className={cn(
                                                    "text-xs font-semibold",
                                                    avatarColors[parseInt(conversation.id) % 3 + 1] || "bg-muted text-muted-foreground"
                                                )}>
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isOnline && (
                                                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="truncate text-sm font-semibold text-foreground">
                                                    {conversation.name || 'Unnamed Chat'}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                                    {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs font-medium text-foreground/80">
                                                {conversation.description || 'No description'}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                                {lastMessage?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                            {isLoadingConversations && (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading conversations...</div>
                            )}
                            {conversations.length === 0 && !isLoadingConversations && (
                                <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Download className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Trash2 className="size-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="px-1 text-sm text-muted-foreground">5 from 36</span>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Reply className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {activeConversation && (
                            <div className="px-7 py-6">
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar size="lg">
                                            {activeConversation.avatar ? (
                                                <AvatarImage src={activeConversation.avatar} alt={activeConversation.name || 'Chat'} />
                                            ) : null}
                                            <AvatarFallback className="bg-violet-200 text-violet-700 font-semibold">
                                                {activeConversation.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-primary">{activeConversation.name || 'Unnamed Chat'}</p>
                                            <p className="text-sm text-muted-foreground">{activeConversation.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        <p>{new Date(activeConversation.updatedAt).toLocaleDateString()}</p>
                                        <p>{new Date(activeConversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {isLoadingMessages && (
                                        <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
                                    )}
                                    {messages.length === 0 && !isLoadingMessages && (
                                        <div className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
                                    )}
                                    {messages.map((message) => {
                                        const isOwn = message.senderId === currentUserId
                                        return (
                                            <div
                                                key={message.id}
                                                className={cn(
                                                    "flex gap-3",
                                                    isOwn ? "flex-row-reverse" : "flex-row"
                                                )}
                                            >
                                                <Avatar size="sm">
                                                    <AvatarFallback className={cn(
                                                        "text-xs font-semibold",
                                                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {message.sender.email?.split('@')[0].slice(0, 2).toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                                                    isOwn
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-foreground"
                                                )}>
                                                    <p className="font-semibold text-xs mb-1">{message.sender.email}</p>
                                                    <p>{message.content}</p>
                                                    <p className="text-[10px] opacity-70 mt-1">
                                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    <div className="border-t border-border bg-background m-4 rounded-xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                            <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                {activeConversation?.name || 'Select a conversation'}
                            </span>
                        </div>

                        <textarea
                            className="min-h-[80px] w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none"
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                        />

                        <div className="flex items-center gap-1 border-t border-border px-3 py-2">
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Undo2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Redo2 className="size-3.5" />
                            </Button>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
                                Sans Serif <ChevronDown className="size-3" />
                            </button>
                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
                                Aa <ChevronDown className="size-3" />
                            </button>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Bold className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Italic className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <Underline className="size-3.5" />
                            </Button>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <AlignLeft className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <List className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between border-t border-border px-3 py-2">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <span className="text-sm font-bold underline">A</span>
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Paperclip className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Link2 className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Smile className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Image className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Video className="size-3.5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <Trash2 className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <MoreHorizontal className="size-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-1.5 rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim() || !activeConversationId}
                                >
                                    <Send className="size-3.5" />
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
