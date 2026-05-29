import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import {useAuth} from "@features/auth/model/use-auth.ts";
import {type RegisterFormData, registerSchema} from "@features/auth/model/auth.schema.ts";

const roles = [
    { value: 'admin',     label: 'Administrator' },
    { value: 'director',  label: 'Director' },
    { value: 'teacher',   label: 'Teacher' },
    { value: 'worker',    label: 'Staff / Worker' },
    { value: 'parent',    label: 'Parent' },
    { value: 'student',   label: 'Student' },
] as const

export function RegisterPage() {
    const { register: registerUser, isLoading, error } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'admin' },
    })

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                <p className="text-gray-500 mt-1 text-sm">Join SchoolManager CD today</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(registerUser)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@school.cd"
                        autoComplete="email"
                        {...register('email')}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Select
                        defaultValue="admin"
                        onValueChange={(val) => setValue('role', val as RegisterFormData['role'])}
                    >
                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.role && (
                        <p className="text-xs text-red-500">{errors.role.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            {...register('password')}
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}