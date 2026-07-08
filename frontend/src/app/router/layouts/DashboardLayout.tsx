import { Outlet } from '@tanstack/react-router'
import type { UserRole } from '@features/auth/model/dto/RegisterDto'
import { Sidebar } from '@/widgets/sidebar/sidebar'
import { Header } from '@/widgets/header/Header'
import { useAppSelector } from '@shared/store/hooks'
import { useState, useEffect } from 'react'
import {VideoCallOverlay} from "@features/video-call/ui/VideoCallOverlay";

export function DashboardLayout() {
    const auth = useAppSelector((state) => state.auth)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
            setSidebarOpen(window.innerWidth >= 1024)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
                collapsed={!sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isMobile={isMobile}
            />

            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex flex-col flex-1 min-w-0 min-h-0 p-3 pl-0">
                <div className="flex flex-col flex-1 min-w-0 min-h-0 p-3 pl-0">
                    <div
                        className="flex flex-col flex-1 min-w-0 min-h-0 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(23,85,236,0.04)] overflow-hidden">
                        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>

                        <main className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 bg-zinc-50/40">
                            <Outlet/>
                        </main>
                    </div>
                </div>
                <VideoCallOverlay/>
            </div>
        </div>
    )
}
