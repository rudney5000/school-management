import { useNavigate, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const LOCALE_STORAGE_KEY = 'locale'

export function useLanguageSwitcher() {
    const navigate = useNavigate()
    const location = useLocation()
    const { i18n } = useTranslation()

    const switchLanguage = async (newLocale: string) => {
        await i18n.changeLanguage(newLocale)

        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)

        const newPath = location.pathname.replace(
            /^\/(fr|en|ru|ln)/,
            `/${newLocale}`
        )

        navigate({
            to: newPath,
            replace: true,
        })
    }

    return {
        locale: i18n.language,
        switchLanguage,
    }
}