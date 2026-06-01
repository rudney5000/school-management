import { useParams } from '@tanstack/react-router'

export function useLocaleRoute() {
    const { locale } = useParams({ strict: false })

    const localeRoute = (
        path: string,
        params?: Record<string, string>
    ) => ({
        to: path,
        params: {
            locale,
            ...params
        }
    })

    return {
        localeRoute
    }
}