import { useParams } from '@tanstack/react-router'

export function useLocaleRoute() {
    const { locale , subSchoolId} = useParams({ strict: false })

    return {
        localeRoute: (
            to: string,
            params?: Record<string, string>
        ) => ({
            to: `/$locale${to}`,
            params: {
                locale: locale ?? 'fr',
                subSchoolId: subSchoolId ?? '',
                ...params,
            },
        }),
    }
}