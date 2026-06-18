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
    CalendarCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {UserRole} from "@features/auth/model/dto/RegisterDto";

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
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/sub-schools/$subSchoolId/dashboard' },
            { labelKey: 'nav.schools',       icon: Building2,       path: '/sub-schools/$subSchoolId/schools' },
            { labelKey: 'nav.classes',       icon: DoorOpen,        path: '/sub-schools/$subSchoolId/classes' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/sub-schools/$subSchoolId/schedules' },
            { labelKey: 'nav.events',        icon: CalendarCheck,    path: '/sub-schools/$subSchoolId/events' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/sub-schools/$subSchoolId/courses' },
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/sub-schools/$subSchoolId/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/sub-schools/$subSchoolId/assessments' },
            { labelKey: 'nav.reports',       icon: BarChart3,       path: '/sub-schools/$subSchoolId/reports' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.teachers',      icon: Users,           path: '/sub-schools/$subSchoolId/teachers' },
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/sub-schools/$subSchoolId/students' },
            { labelKey: 'nav.parents',       icon: UserCheck,       path: '/sub-schools/$subSchoolId/parents' },
        ],
    },
    {
        groupKey: 'nav.group.system',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/sub-schools/$subSchoolId/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/sub-schools/$subSchoolId/settings' },
        ],
    },
]

export const teacherNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/sub-schools/$subSchoolId/dashboard' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/sub-schools/$subSchoolId/schedule' },
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/sub-schools/$subSchoolId/courses' },
            { labelKey: 'nav.events',        icon: CalendarCheck,    path: '/sub-schools/$subSchoolId/events' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/sub-schools/$subSchoolId/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/sub-schools/$subSchoolId/assessments' },
            { labelKey: 'nav.attendance',    icon: ClipboardList,   path: '/sub-schools/$subSchoolId/attendance' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/sub-schools/$subSchoolId/students' },
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/sub-schools/$subSchoolId/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/sub-schools/$subSchoolId/settings' },
        ],
    },
]

export const studentNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/sub-schools/$subSchoolId/dashboard' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/sub-schools/$subSchoolId/schedules' },
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/sub-schools/$subSchoolId/courses' },
            { labelKey: 'nav.events',        icon: CalendarCheck,    path: '/sub-schools/$subSchoolId/events' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/sub-schools/$subSchoolId/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/sub-schools/$subSchoolId/assessments' },
            { labelKey: 'nav.attendance',    icon: ClipboardList,   path: '/sub-schools/$subSchoolId/attendance' },
        ],
    },
    {
        groupKey: 'nav.group.other',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/sub-schools/$subSchoolId/messages', badge: 1 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/sub-schools/$subSchoolId/settings' },
        ],
    },
]

export const directorNav: NavGroup[] = [
    {
        groupKey: 'nav.group.main',
        items: [
            { labelKey: 'nav.dashboard',     icon: LayoutDashboard, path: '/sub-schools/$subSchoolId/dashboard' },
            { labelKey: 'nav.schools',       icon: Building2,       path: '/sub-schools/$subSchoolId/schools' },
            { labelKey: 'nav.classes',       icon: DoorOpen,        path: '/sub-schools/$subSchoolId/classes' },
            { labelKey: 'nav.schedule',      icon: CalendarDays,    path: '/sub-schools/$subSchoolId/schedules' },
            { labelKey: 'nav.events',        icon: CalendarCheck,    path: '/sub-schools/$subSchoolId/events' },
        ],
    },
    {
        groupKey: 'nav.group.pedagogy',
        items: [
            { labelKey: 'nav.courses',       icon: BookOpen,        path: '/sub-schools/$subSchoolId/courses' },
            { labelKey: 'nav.exams',         icon: PenLine,         path: '/sub-schools/$subSchoolId/exams' },
            { labelKey: 'nav.assessments',   icon: TrendingUp,      path: '/sub-schools/$subSchoolId/assessments' },
            { labelKey: 'nav.reports',       icon: BarChart3,       path: '/sub-schools/$subSchoolId/reports' },
        ],
    },
    {
        groupKey: 'nav.group.people',
        items: [
            { labelKey: 'nav.teachers',      icon: Users,           path: '/sub-schools/$subSchoolId/teachers' },
            { labelKey: 'nav.students',      icon: GraduationCap,   path: '/sub-schools/$subSchoolId/students' },
            { labelKey: 'nav.parents',       icon: UserCheck,       path: '/sub-schools/$subSchoolId/parents' },
        ],
    },
    {
        groupKey: 'nav.group.system',
        items: [
            { labelKey: 'nav.messages',      icon: MessageSquare,   path: '/sub-schools/$subSchoolId/messages', badge: 3 },
            { labelKey: 'nav.settings',      icon: Settings,        path: '/sub-schools/$subSchoolId/settings' },
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
                path: '/sub-schools/$subSchoolId/dashboard',
            },
            {
                labelKey: 'nav.children',
                icon: GraduationCap,
                path: '/sub-schools/$subSchoolId/children',
            },
            {
                labelKey: 'nav.schedule',
                icon: CalendarDays,
                path: '/sub-schools/$subSchoolId/schedules',
            },
            { labelKey: 'nav.events',        icon: CalendarCheck,    path: '/sub-schools/$subSchoolId/events' },
        ],
    },
    {
        groupKey: 'nav.group.academic',
        items: [
            {
                labelKey: 'nav.assessments',
                icon: TrendingUp,
                path: '/sub-schools/$subSchoolId/assessments',
            },
            {
                labelKey: 'nav.attendance',
                icon: ClipboardList,
                path: '/sub-schools/$subSchoolId/attendance',
            },
            {
                labelKey: 'nav.reports',
                icon: BarChart3,
                path: '/sub-schools/$subSchoolId/reports',
            },
        ],
    },
    {
        groupKey: 'nav.group.communication',
        items: [
            {
                labelKey: 'nav.messages',
                icon: MessageSquare,
                path: '/sub-schools/$subSchoolId/messages',
                badge: 2,
            },
            {
                labelKey: 'nav.settings',
                icon: Settings,
                path: '/sub-schools/$subSchoolId/settings',
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
                path: '/sub-schools/$subSchoolId',
            },
            {
                labelKey: 'nav.schedule',
                icon: CalendarDays,
                path: '/sub-schools/$subSchoolId/schedules',
            },
        ],
    },
    {
        groupKey: 'nav.group.operations',
        items: [
            {
                labelKey: 'nav.tasks',
                icon: ClipboardList,
                path: '/sub-schools/$subSchoolId/tasks',
            },
            {
                labelKey: 'nav.maintenance',
                icon: Settings,
                path: '/sub-schools/$subSchoolId/maintenance',
            },
            {
                labelKey: 'nav.reports',
                icon: BarChart3,
                path: '/sub-schools/$subSchoolId/reports',
            },
        ],
    },
    {
        groupKey: 'nav.group.communication',
        items: [
            {
                labelKey: 'nav.messages',
                icon: MessageSquare,
                path: '/sub-schools/$subSchoolId/messages',
            },
            {
                labelKey: 'nav.settings',
                icon: Settings,
                path: '/sub-schools/$subSchoolId/settings',
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

