import { Languages } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useLanguageSwitcher } from "@features/change-language";
import type {Locale} from "@shared/config/i18n/locale-config";

export const languages = [
    { code: 'fr' as const, label: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'en' as const, label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'ru' as const, label: 'RU', flag: '🇷🇺', name: 'Русский' },
    { code: 'ln' as const, label: 'LN', flag: '🇨🇩', name: 'Lingála' },
] as const satisfies readonly { code: Locale; label: string; flag: string; name: string }[]

export type Language = typeof languages[number]

export function LanguageSwitcher() {
    const { locale, switchLanguage } = useLanguageSwitcher();

    return (
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
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
    );
}