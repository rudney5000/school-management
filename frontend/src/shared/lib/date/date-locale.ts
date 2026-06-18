import { enUS, fr, ru } from "date-fns/locale"
import type { Locale as DateFnsLocale } from "date-fns"
import {DEFAULT_LOCALE, type Locale} from "@shared/config/i18n/locale-config";

const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = {
    ru,
    fr,
    en: enUS,
    ln: fr,
}

export function getDateFnsLocale(locale: Locale = DEFAULT_LOCALE): DateFnsLocale {
    return DATE_FNS_LOCALES[locale]
}