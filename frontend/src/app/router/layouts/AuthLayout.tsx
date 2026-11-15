import { Outlet } from '@tanstack/react-router';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from '@shared/lib';

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">EcoLinga</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">{t('authLayout.title')}</h1>
          <p className="text-blue-200 text-lg leading-relaxed">{t('authLayout.subtitle')}</p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: 4, label: t('authLayout.languages', { count: 4 }) },
              { value: 7, label: t('authLayout.roles', { count: 7 }) },
              { value: 4, label: t('authLayout.platforms', { count: 4 }) },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-blue-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">
          © {new Date().getFullYear()} EcoLinga. {t('authLayout.rights')}
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">EcoLinga</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
