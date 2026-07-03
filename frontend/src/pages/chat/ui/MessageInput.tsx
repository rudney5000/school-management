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
    MoreHorizontal,
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

interface MessageInputProps {
    messageText: string
    activeConversation: Conversation | null
    activeConversationId: string | null
    onChange: (text: string) => void
    onSend: (attachments?: UploadedFile[]) => void
}

export function MessageInput({
                                 messageText,
                                 activeConversation,
                                 activeConversationId,
                                 onChange,
                                 onSend
}: MessageInputProps) {

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const { uploadFile, isUploading } = useFileUpload(activeConversationId ?? '')

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        setPendingFiles(prev => [...prev, ...files])
        e.target.value = ''
    }

    const handleSend = async () => {
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
        <div className="border-t border-border bg-background m-4 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {activeConversation?.name || 'Select a conversation'}
                </span>
            </div>

            {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                    {pendingFiles.map((file, i) => (
                        <FilePreview
                            key={i}
                            file={file}
                            onRemove={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                        />
                    ))}
                </div>
            )}

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

            <div className="flex items-center justify-between border-t border-border px-3 py-2">
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
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!activeConversationId}
                    >
                        <Paperclip className="size-3.5"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Link2 className="size-3.5"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Smile className="size-3.5"/>
                    </Button>
                    <Button
                        variant="ghost" size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={!activeConversationId}
                    >
                        <Image className="size-3.5"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Video className="size-3.5"/>
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => setPendingFiles([])}
                        disabled={pendingFiles.length === 0}
                    >
                        <Trash2 className="size-3.5"/>
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <MoreHorizontal className="size-3.5"/>
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
                            ? <><Spinner className="size-3.5"/> Uploading...</>
                            : <><Send className="size-3.5"/> Send</>
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}