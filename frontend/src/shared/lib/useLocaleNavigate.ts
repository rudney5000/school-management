import { useNavigate, useParams } from '@tanstack/react-router'

export function useLocaleNavigate() {
    const navigate = useNavigate()
    const { locale } = useParams({ strict: false })

    return {
        navigate: (
            to: string,
            params?: Record<string, string>
        ) =>
            navigate({
                to,
                params: {
                    locale,
                    ...params,
                },
            }),
    }
}