import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import fr from '@shared/config/locales/fr.json'
import en from '@/shared/config/locales/en.json'
import ru from '@/shared/config/locales/ru.json'
import ln from  '@/shared/config/locales/ln.json'

// Next task
// import frCommon from '@shared/config/locales/fr/common.json'
// import frStudents from '@shared/config/locales/fr/dashboard/students.json'
// import enCommon from '@shared/config/locales/en/common.json'
// import enStudents from '@shared/config/locales/en/dashboard/students.json'

// i18n.init({
//     resources: {
//         fr: {
//             common: frCommon,
//             students: frStudents,
//         },
//         en: {
//             common: enCommon,
//             students: enStudents,
//         },
//     },
//     defaultNS: 'common',
//     fallbackLng: 'fr',
// })
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
            ln: {
                translation: ln,
            },
        },
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n