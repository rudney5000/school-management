import { Outlet } from '@tanstack/react-router'
import type { UserRole } from '@features/auth/model/dto/RegisterDto.ts'
import { Sidebar } from '@/widgets/sidebar/sidebar.tsx'
import { Header } from '@/widgets/header/Header.tsx'
import { useAppSelector } from '@shared/store/hooks'

export function DashboardLayout() {
    const auth = useAppSelector((state) => state.auth)

    const role: UserRole = auth.role || 'admin'
    const rawName = auth.email?.split('@')[0] || 'Admin'
    // "ms_patel" → "Ms. Patel"  or just capitalize first letter
    const userName =
        rawName
            .split(/[._-]/)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ')

    const userEmail = auth.email || undefined

    // These can later come from a real API / store slice
    const liveClass = null // e.g. { code: 'CS101', name: 'Intro to Algorithms', room: 'Rm 204' }
    const stats = undefined // e.g. { classes: 3, students: 87, term: 'Q2' }

    const today = new Date()
    const weekOfYear = Math.ceil(
        ((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 +
            new Date(today.getFullYear(), 0, 1).getDay() +
            1) /
        7
    )
    const weekInfo = `${new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(today)} · Week ${weekOfYear} of 52`

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <Sidebar
                role={role}
                userName={userName}
                userEmail={userEmail}
                liveClass={liveClass}
                stats={stats}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header
                    weekInfo={weekInfo}
                    liveClass={liveClass}
                    userName={userName}
                    userDepartment="Computer Science"
                    notificationCount={0}
                />

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}