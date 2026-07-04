import {
    type ChangeEvent,
    useRef,
    useState
} from "react";
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    List,
    Undo2,
    Redo2,
    Link2,
    Paperclip,
    Smile,
    Image,
    Video,
    Trash2,
    Send,
} from 'lucide-react'
import {
    Button,
    Separator,
    Spinner
} from '@shared/ui'
import type {
    Conversation,
    UploadedFile
} from '@entities/chat'
import {useFileUpload} from "@entities/chat/lib/useFileUpload";
import {FilePreview} from "@/pages/chat/ui/FilePreview";
import {
    getConversationDisplayName
} from "@entities/chat/lib/getConversationDisplayName";

interface MessageInputProps {
    messageText: string
    activeConversation: Conversation | null
    activeConversationId: string | null
    currentUserId: string | null
    onChange: (text: string) => void
    onSend: (attachments?: UploadedFile[]) => void
}

export function MessageInput({
                                 messageText,
                                 activeConversation,
                                 activeConversationId,
                                 currentUserId,
                                 onChange,
                                 onSend
}: MessageInputProps) {

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const {
        uploadFile,
        isUploading
    } = useFileUpload(activeConversationId ?? '')

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        setPendingFiles(prev => [...prev, ...files])
        e.target.value = ''
    }

    const handleSend = async () => {
        if (!activeConversationId) {
            console.warn('No active conversation')
            return
        }
        if (!messageText.trim() && pendingFiles.length === 0) return

        const uploaded: UploadedFile[] = []
        for (const file of pendingFiles) {
            const result = await uploadFile(file)
            if (result) uploaded.push(result)
        }

        onSend(uploaded)
        setPendingFiles([])
    }

    return (
        <div className="border-t border-border bg-background rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 border-b border-border pb-2 mb-3">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {activeConversation
                        ? getConversationDisplayName(activeConversation, currentUserId)
                        : 'Select a conversation'}
                </span>
            </div>

            {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {pendingFiles.map((file, i) => (
                        <FilePreview
                            key={i}
                            file={file}
                            onRemove={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                        />
                    ))}
                </div>
            )}

            <textarea
                className="min-h-[80px] w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none border border-border rounded-lg mb-3"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                    }
                }}
            />

            <div className="flex items-center gap-1 border-t border-border px-3 py-2">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Undo2 className="size-3.5"/>
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Redo2 className="size-3.5"/>
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4"/>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Bold className="size-3.5"/>
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Italic className="size-3.5"/>
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Underline className="size-3.5"/>
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4"/>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <AlignLeft className="size-3.5"/>
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <List className="size-3.5"/>
                </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <Button
                        variant="ghost" size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => {
                            if (!activeConversationId) return
                            fileInputRef.current?.click()
                        }}
                    >
                        <Paperclip className="size-4"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Link2 className="size-4"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Smile className="size-4"/>
                    </Button>
                    <Button
                        variant="ghost" size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => {
                            if (!activeConversationId) return
                            imageInputRef.current?.click()
                        }}
                    >
                        <Image className="size-4"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Video className="size-4"/>
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => setPendingFiles([])}
                        disabled={pendingFiles.length === 0}
                    >
                        <Trash2 className="size-4"/>
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5 rounded-full bg-primary px-4 text-primary-foreground"
                        onClick={handleSend}
                        disabled={
                            (!messageText.trim() && pendingFiles.length === 0) ||
                            !activeConversationId ||
                            isUploading
                        }
                    >
                        {isUploading
                            ? <><Spinner className="size-4"/> Uploading...</>
                            : <><Send className="size-4"/> Send</>
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}