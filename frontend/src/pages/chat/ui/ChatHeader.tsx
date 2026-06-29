import {
    Search,
    SlidersHorizontal,
    Settings,
    Bell
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Input
} from '@shared/ui'

export function ChatHeader() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat</h1>
                <div className="flex gap-3 text-sm">
                    <button className="font-semibold text-primary">Dashboard</button>
                    <button className="text-muted-foreground hover:text-foreground">Shared</button>
                </div>
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
                <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground">
                    <Settings className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground">
                    <Bell className="size-4" />
                </Button>
                <div className="flex items-center gap-2.5">
                    <Avatar size="lg">
                        <AvatarImage src="/image.png" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">U</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}