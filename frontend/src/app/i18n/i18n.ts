import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import fr from '@shared/config/locales/fr.json'
import en from '@/shared/config/locales/en.json'
import ru from '@/shared/config/locales/ru.json'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            fr: {
                translation: fr,
            },
            en: {
                translation: en,
            },
            ru: {
                translation: ru,
            },
        },
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n