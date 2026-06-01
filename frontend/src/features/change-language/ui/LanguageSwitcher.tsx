import { Languages } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useLanguageSwitcher } from "@features/change-language";

const languages = [
    { code: "fr", label: "FR", flag: "🇫🇷" },
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "ru", label: "RU", flag: "🇷🇺" },
] as const;

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