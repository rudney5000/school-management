import {createRootRoute, createRoute, createRouter, Outlet, RouterProvider} from "@tanstack/react-router";
import {HomeLayout} from "@app/router/layouts/HomeLayout";
import {HomePage} from "@/pages/home/HomePage";
import {NotFoundPage} from "@/pages/404/NotFoundPage.tsx";
import {FAQPage} from "@/pages/faq/FAQPage.tsx";
import {AuthLayout} from "@app/router/layouts/AuthLayout.tsx";
import {requireGuest} from "@app/router/guards.ts";
import {LoginPage} from "@/pages/login/LoginPage.tsx";
import {RegisterPage} from "@/pages/register/RegisterPage.tsx";

const rootRoute = createRootRoute({
    component: Outlet,
    notFoundComponent: NotFoundPage
});

const homeLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'home-layout',
    component: HomeLayout,
});

const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'auth-layout',
    component: AuthLayout,
    beforeLoad: requireGuest
});

const homeRoute = createRoute({
    getParentRoute: () => homeLayoutRoute,
    path: '/',
    component: HomePage
})

const faqRoute = createRoute({
    getParentRoute: () => homeLayoutRoute,
    path: '/faq',
    component: FAQPage
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <div>Dashboard</div>
})

const loginRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: '/login',
    component: LoginPage
})

const registerRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: '/register',
    component: RegisterPage
})

const routeTree = rootRoute.addChildren([
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
    dashboardRoute
    ]);

export const router = createRouter({ routeTree });

export const AppRouter = () => <RouterProvider router={router} />