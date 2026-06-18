import { useTranslation } from "react-i18next"
import { getDateFnsLocale } from "./date-locale"
import {DEFAULT_LOCALE, isSupportedLocale} from "@shared/config/i18n/locale-config";

export function useDateLocale() {
    const { i18n } = useTranslation()
    const lang = i18n.language.split("-")[0]
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE
    return getDateFnsLocale(locale)
}