export type Locale = 'ru' | 'fr' | 'en' | 'ln'

export const SUPPORT_LOCALES: readonly Locale[] = ['ru', 'fr', 'en', 'ln'] as const
export const DEFAULT_LOCALE: Locale = 'ru'

export function isSupportedLocale(lang: string | undefined): lang is Locale {
    return !!lang && SUPPORT_LOCALES.includes(lang as Locale)
}

export const LOCALE_INFO: Record<Locale, { name: string; flag: string }> = {
    ru: { name: 'Русский', flag: '🇷🇺' },
    fr: { name: 'Français', flag: '🇫🇷' },
    en: { name: 'English', flag: '🇬🇧' },
    ln: { name: 'Lingála', flag: '🇨🇩' },
}