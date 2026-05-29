import { redirect } from '@tanstack/react-router'
import { store } from '@/shared/store'

export function requireAuth() {
    const { isAuthenticated } = store.getState().auth
    if (!isAuthenticated) {
        throw redirect({ to: '/login' })
    }
}

export function requireGuest() {
    const { isAuthenticated } = store.getState().auth
    if (isAuthenticated) {
        throw redirect({ to: '/dashboard' })
    }
}

export function requireRole(roles: string[]) {
    const { isAuthenticated, role } = store.getState().auth
    if (!isAuthenticated) {
        throw redirect({ to: '/login' })
    }
    if (!role || !roles.includes(role)) {
        throw redirect({ to: '/dashboard' })
    }
}
