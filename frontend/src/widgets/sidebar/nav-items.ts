import {
    LayoutDashboard,
    Building2,
    DoorOpen,
    CalendarDays,
    BookOpen,
    PenLine,
    TrendingUp,
    Users,
    GraduationCap,
    UserCheck,
    Settings,
    BarChart3,
    ClipboardList,
    MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {UserRole} from "@features/auth/model/dto/RegisterDto.ts";

export type NavItem = {
    labelKey: string
    icon: LucideIcon
    path: string
    badge?: number
}

export type NavGroup = {
    groupKey: string
    items: NavItem[]
}

export const adminNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/dashboard' },
            { labelKey: 'nav.schools',       icon: Building2,       path: '/dashboard/schools' },
            { labelKey: 'nav.classes',       icon: DoorOpen,        path: '/dashboard/classes' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/dashboard/schedule' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/dashboard/courses' },
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/dashboard/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/dashboard/assessments' },
            { labelKey: 'nav.reports',       icon: BarChart3,       path: '/dashboard/reports' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.teachers',      icon: Users,           path: '/dashboard/teachers' },
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/dashboard/students' },
            { labelKey: 'nav.parents',       icon: UserCheck,       path: '/dashboard/parents' },
        ],
    },
    {
        groupKey: 'nav.group.system',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/dashboard/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/dashboard/settings' },
        ],
    },
]

export const teacherNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/dashboard' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/dashboard/schedule' },
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/dashboard/courses' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/dashboard/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/dashboard/assessments' },
            { labelKey: 'nav.attendance',    icon: ClipboardList,   path: '/dashboard/attendance' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/dashboard/students' },
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/dashboard/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/dashboard/settings' },
        ],
    },
]

export const studentNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/dashboard' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/dashboard/schedule' },
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/dashboard/courses' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/dashboard/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/dashboard/assessments' },
            { labelKey: 'nav.attendance',    icon: ClipboardList,   path: '/dashboard/attendance' },
        ],
    },
    {
        groupKey: 'nav.group.other',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/dashboard/messages', badge: 1 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/dashboard/settings' },
        ],
    },
]

export const directorNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/dashboard' },
            { labelKey: 'nav.schools',       icon: Building2,       path: '/dashboard/schools' },
            { labelKey: 'nav.classes',       icon: DoorOpen,        path: '/dashboard/classes' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/dashboard/schedule' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/dashboard/courses' },
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/dashboard/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/dashboard/assessments' },
            { labelKey: 'nav.reports',       icon: BarChart3,       path: '/dashboard/reports' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.teachers',      icon: Users,           path: '/dashboard/teachers' },
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/dashboard/students' },
            { labelKey: 'nav.parents',       icon: UserCheck,       path: '/dashboard/parents' },
        ],
    },
    {
        groupKey: 'nav.group.system',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/dashboard/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/dashboard/settings' },
        ],
    },
]

export const parentNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            {
                labelKey: 'nav.dashboard',
                icon: LayoutDashboard,
                path: '/dashboard',
            },
            {
                labelKey: 'nav.children',
                icon: GraduationCap,
                path: '/dashboard/children',
            },
            {
                labelKey: 'nav.schedule',
                icon: CalendarDays,
                path: '/dashboard/schedule',
            },
        ],
    },
    {
        groupKey: 'nav.group.academic',
        items: [
            {
                labelKey: 'nav.assessments',
                icon: TrendingUp,
                path: '/dashboard/assessments',
            },
            {
                labelKey: 'nav.attendance',
                icon: ClipboardList,
                path: '/dashboard/attendance',
            },
            {
                labelKey: 'nav.reports',
                icon: BarChart3,
                path: '/dashboard/reports',
            },
        ],
    },
    {
        groupKey: 'nav.group.communication',
        items: [
            {
                labelKey: 'nav.messages',
                icon: MessageSquare,
                path: '/dashboard/messages',
                badge: 2,
            },
            {
                labelKey: 'nav.settings',
                icon: Settings,
                path: '/dashboard/settings',
            },
        ],
    },
]

export const workerNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            {
                labelKey: 'nav.dashboard',
                icon: LayoutDashboard,
                path: '/dashboard',
            },
            {
                labelKey: 'nav.schedule',
                icon: CalendarDays,
                path: '/dashboard/schedule',
            },
        ],
    },
    {
        groupKey: 'nav.group.operations',
        items: [
            {
                labelKey: 'nav.tasks',
                icon: ClipboardList,
                path: '/dashboard/tasks',
            },
            {
                labelKey: 'nav.maintenance',
                icon: Settings,
                path: '/dashboard/maintenance',
            },
            {
                labelKey: 'nav.reports',
                icon: BarChart3,
                path: '/dashboard/reports',
            },
        ],
    },
    {
        groupKey: 'nav.group.communication',
        items: [
            {
                labelKey: 'nav.messages',
                icon: MessageSquare,
                path: '/dashboard/messages',
            },
            {
                labelKey: 'nav.settings',
                icon: Settings,
                path: '/dashboard/settings',
            },
        ],
    },
]

export const navByRole: Record<UserRole, NavGroup[]> = {
    admin:   adminNav,
    teacher: teacherNav,
    student: studentNav,
    director: directorNav,
    parent:  parentNav,
    worker:  workerNav,
} as const

