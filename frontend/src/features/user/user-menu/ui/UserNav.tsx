import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { useAppSelector, useAppDispatch } from '@/shared/store/hooks'
import { UserAvatar } from '@/features/user/ui/UserAvatar'
import {logout} from "@features/auth/store/auth-slice";
import { useTranslation } from '@/shared/lib/useTranslation'
import {useLocaleRoute} from "@shared/lib";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {LocaleLink} from "@shared/ui";

export function UserNav() {
    const { t } = useTranslation()
    const { localeRoute } = useLocaleRoute();
    const router = useRouter()
    const dispatch = useAppDispatch()
    const user = useAppSelector(state => state.auth)

    const userName = user.email?.split('@')[0] || 'Admin'
    const handleLogout = () => {
        localStorage.clear()
        dispatch(logout())
        const loginRoute = localeRoute('/login')
        router.navigate({
            to: loginRoute.to,
            params: loginRoute.params,
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-zinc-50 transition-colors group">
                    <UserAvatar userName={userName} />
                    <div className="hidden lg:flex flex-col items-start leading-none">
                        <p className="text-[12px] font-semibold text-zinc-900">{userName}</p>
                        {user.role && (
                            <p className="text-[10px] text-zinc-400 capitalize">{user.role}</p>
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <LocaleLink to='/profile' >
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>{t('user.profile')}</span>
                        </DropdownMenuItem>
                    </LocaleLink>

                    <LocaleLink to='/settings'>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t('user.settings')}</span>
                        </DropdownMenuItem>
                    </LocaleLink>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('user.logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}