import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import {getInitials} from "@shared/lib/getInitial";

interface UserAvatarProps {
    userName: string
    avatarUrl?: string
    className?: string
}

export function UserAvatar({ userName, avatarUrl, className }: UserAvatarProps) {
    return (
        <Avatar className={cn('h-8 w-8 border border-zinc-200', className)}>
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-indigo-600 text-[11px] font-semibold text-white">
                {getInitials(userName)}
            </AvatarFallback>

        </Avatar>
    )
}