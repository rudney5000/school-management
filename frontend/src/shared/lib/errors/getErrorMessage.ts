import type {Locale} from "@shared/config/i18n/locale-config";
import {errors} from "@shared/lib";
import type {ErrorKey} from "@shared/lib";

const currentLang: Locale = "fr";

export function getErrorMessage(path: ErrorKey): string {
    const [group, key] = path.split(".") as [
        keyof typeof errors,
        string
    ];

    return errors[group][key as keyof typeof errors[typeof group]][currentLang];
}