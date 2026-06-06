import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { useAuth } from '@features/auth/model/use-auth';
import {
    loginSchema,
    type LoginFormData,
} from '@features/auth/model/auth.schema';

import {
    Button,
    Input,
    Label,
    Alert,
    AlertDescription,
    LocaleLink,
} from '@/shared/ui';
import {cn} from "@shared/lib";

export function LoginForm() {
    const { login, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(login)} className="space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@school.cd"
                        autoComplete="email"
                        {...register('email')}
                        className={cn(
                            "w-full",
                            errors.email && "border-red-500 focus-visible:ring-red-500"
                        )}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...register('password')}
                            className={cn(
                                "w-full pr-10",
                                errors.password && "border-red-500 focus-visible:ring-red-500"
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <LocaleLink to="/register">Create one</LocaleLink>
            </p>
        </>
    );
}