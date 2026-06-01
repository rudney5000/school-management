export type Locale = 'ru' | 'fr' | 'en'

export const SUPPORT_LOCALES: Locale[] = ['ru', 'fr', 'en']
export const DEFAULT_LOCALE: Locale = 'ru'

export function isSupportedLocale(lang: string | undefined): lang is Locale {
    return SUPPORT_LOCALES.includes(lang as Locale)
}