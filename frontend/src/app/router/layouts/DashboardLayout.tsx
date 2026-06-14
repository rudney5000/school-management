import { Outlet } from '@tanstack/react-router'
import type { UserRole } from '@features/auth/model/dto/RegisterDto.ts'
import { Sidebar } from '@/widgets/sidebar/sidebar'
import { Header } from '@/widgets/header/Header'
import { useAppSelector } from '@shared/store/hooks'

export function DashboardLayout() {
    const auth = useAppSelector((state) => state.auth)

    const role: UserRole = auth.role || 'admin'
    const rawName = auth.email?.split('@')[0] || 'Admin'
    const userName = rawName
        .split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')

    const userEmail = auth.email || undefined

    const liveClass = null
    const stats = undefined

    return (
        <div className="flex h-screen bg-[#F4F7FB] overflow-hidden text-zinc-900">
            <Sidebar
                role={role}
                userName={userName}
                userEmail={userEmail}
                liveClass={liveClass}
                stats={stats}
            />

            <div className="flex flex-col flex-1 min-w-0 p-3 pl-0">
                <div className="flex flex-col flex-1 min-w-0 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(23,85,236,0.04)] overflow-hidden">
                    <Header />

                    <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-50/40">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}
