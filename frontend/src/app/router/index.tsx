import {createRootRoute, createRoute, createRouter, Outlet, RouterProvider} from "@tanstack/react-router";
import {HomeLayout} from "@app/router/layouts/HomeLayout";
import {HomePage} from "@/pages/home/HomePage";
import {NotFoundPage} from "@/pages/404/NotFoundPage.tsx";

const rootRoute = createRootRoute({
    component: Outlet,
    notFoundComponent: NotFoundPage
});

const homeLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'home-layout',
    component: HomeLayout,
});

const homeRoute = createRoute({
    getParentRoute: () => homeLayoutRoute,
    path: '/',
    component: HomePage
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/dashboard',
    component: () => <div>Dashboard</div>
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <div>Login</div>
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: () => <div>Inscription</div>
})

const routeTree = rootRoute.addChildren([
    homeLayoutRoute
        .addChildren(
    [
        homeRoute
    ]),
    loginRoute,
    registerRoute,
    dashboardRoute
    ]);

export const router = createRouter({ routeTree });

export const AppRouter = () => <RouterProvider router={router} />