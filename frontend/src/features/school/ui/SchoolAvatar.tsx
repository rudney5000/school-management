import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'
import {getInitials} from "@shared/lib/getInitial";

export function SchoolAvatar({ name, logoUrl, className }: { name: string, logoUrl?: string | null, className?: string }) {
    return (
        <Avatar className={cn('h-5 w-5 rounded-md border border-zinc-200', className)}>
            <AvatarImage src={logoUrl || undefined} alt={name} />
            <AvatarFallback className="bg-indigo-100 text-[10px] font-bold text-indigo-600">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    )
}