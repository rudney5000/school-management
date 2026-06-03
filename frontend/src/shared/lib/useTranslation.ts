import { useTranslation as useI18NextTranslation } from 'react-i18next'
import {SUPPORT_LOCALES} from "@shared/config/i18n/locale-config";

const LOCALE_STORAGE_KEY = 'locale'

export function useTranslation() {
    const { t, i18n } = useI18NextTranslation()

    const setLocale = async (lang: string) => {
        await i18n.changeLanguage(lang)
        localStorage.setItem(LOCALE_STORAGE_KEY, lang)
    }

    const initLocale = async () => {
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)

        if (
            savedLocale &&
            SUPPORT_LOCALES.includes(savedLocale as never)
        ) {
            await i18n.changeLanguage(savedLocale)
        }
    }

    return {
        t,
        locale: i18n.language,
        setLocale,
        initLocale,
        availableLocales: i18n.languages
    }
}