import {Outlet} from "@tanstack/react-router";

export const HomeLayout = () => (
    <div className="min-h-screen bg-gray-50">
        <Outlet />
    </div>
);