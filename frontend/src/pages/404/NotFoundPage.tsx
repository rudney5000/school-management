
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {Button} from "@shared/ui/button.tsx";
import {Card} from "@shared/ui/card.tsx";
import { useTranslation } from '@/shared/lib';
import { Navigation } from "@shared/ui/Navigation";

export function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950 flex items-center justify-center">
            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
                <Navigation />

                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-5">
                            <div className="text-[8rem] font-bold leading-none tracking-tighter text-blue-600 opacity-10 sm:text-[10rem]">
                                404
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                {t('notFound.page_not_found')}
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-slate-600">
                                {t('notFound.description')}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link to="/">
                                    <Home className="mr-2 h-5 w-5" />
                                    {t('notFound.back_to_home')}
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                                <Link to="/">
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    {t('notFound.previous_page')}
                                </Link>
                            </Button>
                        </div>

                        <div className="rounded-[2rem] border-0 bg-white/50 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Search className="h-5 w-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-slate-950">{t('notFound.looking_for_something')}</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {t('notFound.use_navigation')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-6 top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

                        <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-blue-600 p-8 text-white shadow-[0_30px_80px_rgba(37,99,235,0.35)]">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                                        <Search className="h-10 w-10" />
                                    </div>
                                    <h2 className="text-2xl font-semibold">
                                        {t('notFound.page_on_trip')}
                                    </h2>
                                    <p className="mt-3 text-white/80">
                                        {t('notFound.dont_worry')}
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">{t('notFound.school_management')}</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            {t('notFound.complete_platform')}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">{t('notFound.establishments')}</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            {t('notFound.join_community')}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">{t('notFound.multi_users')}</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            {t('notFound.users_list')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>
        </main>
    );
}
