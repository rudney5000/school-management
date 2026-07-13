import { Button } from "@shared/ui";
import { LocaleLink } from "@shared/ui";
import { useTranslation } from '@/shared/lib';
import { LanguageSwitcher } from "@features/change-language/ui/LanguageSwitcher";

export function Navigation() {
    const { t } = useTranslation();

    return (
        <nav className="mb-10 flex items-center justify-between rounded-full bg-white/70 px-5 py-4 backdrop-blur">
            <LocaleLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    S
                </div>
                <span className="text-2xl font-semibold tracking-tight text-blue-600">
                    SchoolHub
                </span>
            </LocaleLink>

            <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
                <a href="#features" className="hover:text-slate-950">
                    {t('home.hero_section.features')}
                </a>
                <a href="#users" className="hover:text-slate-950">
                    {t('home.hero_section.users')}
                </a>
                <LocaleLink to='/faq' className="hover:text-slate-950">
                    {t('home.hero_section.faq')}
                </LocaleLink>
            </div>

            <div className="flex items-center gap-3">
                <LanguageSwitcher />

                <LocaleLink to='/login'>
                    {t('home.hero_section.login')}
                </LocaleLink>
                <Button className="rounded-full px-6">{t('home.hero_section.get_started')}</Button>
            </div>
        </nav>
    );
}
