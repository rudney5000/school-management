import { redirect } from '@tanstack/react-router'
import { store } from '@/shared/store'

export function requireAuth({ params }: {params: { locale: string }}) {
    const { isAuthenticated } = store.getState().auth
    if (!isAuthenticated) {
        throw redirect({
            to: '/$locale/login',
            params: {
                locale: params.locale
            }
        })
    }
}

export function requireGuest({ params }: {params: { locale: string }}) {
    const { isAuthenticated } = store.getState().auth
    if (isAuthenticated) {
        throw redirect({
            to: '/$locale/dashboard',
            params: {
                locale: params.locale
            }
        })
    }
}

// export function requireRole(roles: string[]) {
//     const { isAuthenticated, role } = store.getState().auth
//     if (!isAuthenticated) {
//         throw redirect({ to: '/login' })
//     }
//     if (!role || !roles.includes(role)) {
//         throw redirect({ to: '/dashboard' })
//     }
// }
