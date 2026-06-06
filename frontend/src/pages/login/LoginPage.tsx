import {LoginForm} from "@/pages/login/ui/LoginForm";

export function LoginPage() {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
            </div>
            <LoginForm/>
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Demo credentials</p>
                <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Admin:</span> admin@saintjoseph.cd
                    </p>
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Password:</span> password123
                    </p>
                </div>
            </div>
        </div>
    )
}