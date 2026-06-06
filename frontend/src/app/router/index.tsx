import {createRootRoute, createRoute, createRouter, Outlet, redirect, RouterProvider} from "@tanstack/react-router";
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
import {DashboardPage} from "@/pages/dashboard";
import {SUPPORT_LOCALES} from "@shared/config/i18n/locale-config";
import StudentsPage from "@/pages/student/StudentsPage.tsx";

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
    component: DashboardPage,
})

// const dashboardIndexRoute = createRoute({
//     getParentRoute: () => dashboardBaseRoute,
//     path: '/',
//     component: DashboardPage
// })

// export const schoolRoute = createRoute({
//     getParentRoute: () => dashboardRoute,
//     path: 'schools/$schoolId',
//     component: SchoolPage
// })

const studentRoute = createRoute({
    getParentRoute: () => subSchoolRoute,
    path: 'students',
    component: StudentsPage
})

const routeTree = rootRoute.addChildren([
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
                    studentRoute
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