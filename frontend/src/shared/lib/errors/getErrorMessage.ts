import type {Locale} from "@shared/config/i18n/locale-config";
import {errors} from "@shared/lib";
import type {ErrorKey} from "@shared/lib";
import i18n from "@app/i18n/i18n";
export function getErrorMessage(path: ErrorKey): string {
    const [group, key] = path.split(".") as [
        keyof typeof errors,
        string
    ];

    const lang = i18n.language as Locale

    return (
        errors[group]?.[
            key as keyof typeof errors[typeof group]
            ]?.[lang] ??
            path
    );
}