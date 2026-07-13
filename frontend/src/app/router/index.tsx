import {
    createRootRoute,
    createRoute,
    createRouter,
    lazyRouteComponent,
    Outlet,
    redirect,
    RouterProvider
} from "@tanstack/react-router";
import {HomeLayout} from "@app/router/layouts/HomeLayout";
import {HomePage} from "@/pages/home/HomePage";
import {NotFoundPage} from "@/pages/404/NotFoundPage";
import {FAQPage} from "@/pages/faq/FAQPage";
import {AuthLayout} from "@app/router/layouts/AuthLayout";
import {requireGuest} from "@app/router/guards";
import {LoginPage} from "@/pages/login/LoginPage";
import {RegisterPage} from "@/pages/register/RegisterPage";
import i18n from "@app/i18n/i18n";
import {DashboardLayout} from "@app/router/layouts/DashboardLayout";
import {DEFAULT_LOCALE, SUPPORT_LOCALES} from "@shared/config/i18n/locale-config";

type RouterContext = {
    isAuthenticated: () => boolean;
    userRole: () => string | null;
};

function LocaleOutlet() {
    return <Outlet />
}

const rootRoute = createRootRoute({
    component: LocaleOutlet,
    notFoundComponent: NotFoundPage
});

const indexRedirectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({
            to: '/$locale',
            params: { locale: DEFAULT_LOCALE }
        })
    }
})

const localeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale',
    beforeLoad: async ({ params }) => {
        const locale = params.locale as string

        if (!SUPPORT_LOCALES.includes(locale as never)) {
            throw redirect({
                to: '/$locale',
                params: {
                    locale: SUPPORT_LOCALES[0]
                }
            })
        }

        await i18n.changeLanguage(locale)
    },
    component: LocaleOutlet
});

const homeLayoutRoute = createRoute({
    getParentRoute: () => localeRoute,
    id: 'home-layout',
    component: HomeLayout,
});

const authLayoutRoute = createRoute({
    getParentRoute: () => localeRoute,
    id: 'auth-layout',
    component: AuthLayout,
    beforeLoad: requireGuest
});

const dashboardLayoutRoute = createRoute({
    getParentRoute: () => localeRoute,
    id: 'dashboard',
    component: DashboardLayout,
    beforeLoad: ({ context, params }) => {
        const ctx = context as RouterContext

        if(!ctx.isAuthenticated()) {
            throw redirect({
                to: '/$locale/login',
                params: { locale: params.locale }
            })
        }
    },
    notFoundComponent: NotFoundPage
})

const homeRoute = createRoute({
    getParentRoute: () => homeLayoutRoute,
    path: '/',
    component: HomePage
})

const faqRoute = createRoute({
    getParentRoute: () => homeLayoutRoute,
    path: 'faq',
    component: FAQPage
})

const loginRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'login',
    component: LoginPage
})

const registerRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'register',
    component: RegisterPage
})

export const subSchoolRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: 'sub-schools/$subSchoolId',
    component: LocaleOutlet
})

const dashboardRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'dashboard',
    component: lazyRouteComponent(() => import('@/pages/dashboard').then(m => ({ default: m.DashboardPage }))),
})

const studentRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'students',
    component: lazyRouteComponent(() => import('@/pages/student/StudentsPage'))
})

const studentDetailRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'students/$studentId',
    component: lazyRouteComponent(() => import('@/pages/student/StudentDetailsPage')),
})

const teacherDetailRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'teachers/$teacherId',
    component: LocaleOutlet
})

const parentDetailRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'parents/$parentId',
    component: LocaleOutlet
})

const teachersRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'teachers',
    component: lazyRouteComponent(() => import('@/pages/teacher/TeachersPage')),
})

const parentsRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'parents',
    component: lazyRouteComponent(() => import('@/pages/parent/ParentsPage')),
})

const classesRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'classes',
    component: lazyRouteComponent(() => import('@/pages/class/ClassPage')),
})

const coursesRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'courses',
    component: lazyRouteComponent(() => import('@/pages/courses/CoursesPage')),
})

const scheduleRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'schedules',
    component: lazyRouteComponent(() => import('@/pages/schedule/SchedulePage')),
})

const eventsRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'events',
    component: lazyRouteComponent(() => import('@/pages/event/EventPage')),
})

const attendancesRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'attendances',
    component: lazyRouteComponent(() => import('@/pages/attendances/AttendancesPage')),
})

const assessmentsRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'assessments',
    component: lazyRouteComponent(() => import('@/pages/exams/AssessmentsPage').then(m => ({ default: m.AssessmentsPage }))),
})

const chatRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'messages',
    component: lazyRouteComponent(() => import('@/pages/chat/ChatPage').then(m => ({ default: m.ChatPage }))),
})

const routeTree = rootRoute.addChildren([
    indexRedirectRoute,
    localeRoute.addChildren([
        homeLayoutRoute
            .addChildren([
                homeRoute,
                faqRoute
            ]),
        authLayoutRoute
            .addChildren([
                loginRoute,
                registerRoute
            ]),
        dashboardLayoutRoute
            .addChildren([
                subSchoolRoute.addChildren([
                    dashboardRoute,
                    studentRoute,
                    studentDetailRoute,
                    teachersRoute,
                    parentsRoute,
                    classesRoute,
                    coursesRoute,
                    teacherDetailRoute,
                    parentDetailRoute,
                    scheduleRoute,
                    eventsRoute,
                    attendancesRoute,
                    assessmentsRoute,
                    chatRoute,
                ]),
            ])
    ])
]);

export const router = createRouter({
    routeTree,
    context: {
        isAuthenticated: () => !!localStorage.getItem('accessToken'),
        userRole: () => localStorage.getItem('role'),
    }
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export const AppRouter = () => <RouterProvider router={router} />