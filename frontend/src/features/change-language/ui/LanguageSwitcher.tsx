import { Languages, Check } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useLanguageSwitcher } from "@features/change-language"
import type { Locale } from "@shared/config/i18n/locale-config"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@shared/ui"

export const languages = [
    { code: 'fr' as const, label: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'en' as const, label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'ru' as const, label: 'RU', flag: '🇷🇺', name: 'Русский' },
    { code: 'ln' as const, label: 'LN', flag: '🇨🇩', name: 'Lingála' },
] as const satisfies readonly { code: Locale; label: string; flag: string; name: string }[]

export type Language = typeof languages[number]

export function LanguageSwitcher() {
    const { locale, switchLanguage } = useLanguageSwitcher()
    const active = languages.find((l) => l.code === locale) ?? languages[0]

    return (
        <>
            <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Languages className="h-3.5 w-3.5 text-muted-foreground mx-1 shrink-0" />
                {languages.map(({ code, label, flag }) => (
                    <button
                        key={code}
                        onClick={() => switchLanguage(code)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                            locale === code
                                ? "bg-white text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                        )}
                    >
                        <span className="text-sm">{flag}</span>
                        {label}
                    </button>
                ))}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "md:hidden flex items-center justify-center h-9 w-9 rounded-xl",
                            "bg-muted/50 text-foreground hover:bg-muted transition-colors"
                        )}
                        aria-label="Changer de langue"
                    >
                        <span className="text-base leading-none">{active.flag}</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {languages.map(({ code, label, flag, name }) => (
                        <DropdownMenuItem
                            key={code}
                            onClick={() => switchLanguage(code)}
                            className="flex items-center justify-between gap-2 text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{flag}</span>
                                <span>{name}</span>
                            </span>
                            {locale === code && <Check className="h-3.5 w-3.5 text-primary" />}
                            {locale !== code && (
                                <span className="text-[10px] text-muted-foreground">{label}</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}