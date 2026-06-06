import {RegisterForm} from "@/pages/register/ui/RegisterForm";

export function RegisterPage() {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                <p className="text-gray-500 mt-1 text-sm">Join SchoolManager CD today</p>
            </div>
            <RegisterForm/>
        </div>
    )
}