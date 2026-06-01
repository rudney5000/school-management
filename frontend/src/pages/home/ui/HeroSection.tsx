import {Link} from "@tanstack/react-router";
import {Button} from "@shared/ui/button.tsx";
import {Badge} from "@shared/ui/badge.tsx";
import {Card} from "@shared/ui/card.tsx";
import {Calendar, Clock, MessageSquare, ShieldCheck, Smartphone, Trophy} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@shared/ui/accordion.tsx";
import { useTranslation } from '@/shared/lib/useTranslation';
import {LanguageSwitcher} from "@features/change-language/ui/LanguageSwitcher.tsx";

export function HeroSection() {
    const { t } = useTranslation();
    
    const stats = [
        { value: "150+", label: t('home.hero_section.establishments') },
        { value: "50K+", label: t('home.hero_section.active_students') },
        { value: "98%", label: t('home.hero_section.satisfaction') },
    ];
    return (
        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
            <nav className="mb-10 flex items-center justify-between rounded-full bg-white/70 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                        S
                    </div>
                    <span className="text-2xl font-semibold tracking-tight text-blue-600">
                        SchoolHub
                    </span>
                </div>

                <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
                    <a href="#features" className="hover:text-slate-950">
                        {t('home.hero_section.features')}
                    </a>
                    <a href="#users" className="hover:text-slate-950">
                        {t('home.hero_section.users')}
                    </a>
                    <Link to="/faq" className="hover:text-slate-950">
                        {t('home.hero_section.faq')}
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <Link to="/login" className="rounded-full">
                        {t('home.hero_section.login')}
                    </Link>
                    <Button className="rounded-full px-6">{t('home.hero_section.get_started')}</Button>
                </div>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                    <div className="space-y-5">
                        <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
                            {t('home.hero_section.available_now')}
                        </Badge>

                        <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                            {t('home.hero_section.complete_platform')}
                        </h1>

                        <p className="max-w-xl text-lg leading-8 text-slate-600">
                            {t('home.hero_section.platform_description')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="rounded-full px-8">
                            {t('home.hero_section.start_free')}
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8">
                            {t('home.hero_section.view_demo')}
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {stats.map((s) => (
                            <Card key={s.label} className="rounded-3xl border-0 bg-white p-5 shadow-sm">
                                <div className="text-2xl font-semibold">{s.value}</div>
                                <div className="mt-1 text-sm text-slate-600">{s.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -left-6 top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl"/>
                    <div className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"/>

                    <Card
                        className="relative overflow-hidden rounded-[2rem] border-0 bg-blue-600 p-6 text-white shadow-[0_30px_80px_rgba(37,99,235,0.35)]">
                        <div className="mb-6 flex items-center justify-between text-sm text-white/80">
                            <span className="font-semibold">SchoolHub</span>
                            <span>{t('home.hero_section.trusted_by')}</span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-[1.75rem] bg-white p-6 text-slate-950 shadow-lg">
                                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                                    <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                        <div
                                            className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <ShieldCheck className="h-4 w-4"/>
                                        </div>
                                        <h3 className="font-semibold">{t('home.hero_section.security_guaranteed')}</h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {t('home.hero_section.security_description')}
                                        </p>
                                    </Card>

                                    <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                        <div
                                            className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <MessageSquare className="h-4 w-4"/>
                                        </div>
                                        <h3 className="font-semibold">{t('home.hero_section.fluid_communication')}</h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {t('home.hero_section.communication_description')}
                                        </p>
                                    </Card>
                                </div>

                                <h2 className="max-w-md text-3xl font-semibold tracking-tight">
                                    {t('home.hero_section.everything_to_succeed')}
                                </h2>

                                <div className="mt-6 space-y-3">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>{t('home.hero_section.real_time_grades')}</AccordionTrigger>
                                            <AccordionContent>
                                                {t('home.hero_section.real_time_grades_description')}
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>{t('home.hero_section.interactive_schedule')}</AccordionTrigger>
                                            <AccordionContent>
                                                {t('home.hero_section.interactive_schedule_description')}
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>{t('home.hero_section.digital_classroom')}</AccordionTrigger>
                                            <AccordionContent>
                                                {t('home.hero_section.digital_classroom_description')}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Card
                                    className="overflow-hidden rounded-[1.75rem] border-0 bg-white p-4 text-slate-950 shadow-lg">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <Smartphone className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <div className="font-semibold">{t('home.hero_section.mobile_app')}</div>
                                            <div className="text-sm text-slate-600">{t('home.hero_section.available_ios_android')}</div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl bg-slate-100 p-4">
                                        <div
                                            className="mx-auto h-64 max-w-[220px] rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-700 p-3 text-white shadow-xl">
                                            <div className="h-full rounded-[1.5rem] bg-white p-4 text-slate-950">
                                                <div className="text-xs text-slate-500">{t('home.hero_section.my_space')}</div>
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex items-center gap-2 rounded-2xl bg-blue-50 p-3">
                                                        <Calendar className="h-4 w-4 text-blue-600"/>
                                                        <span className="text-xs font-medium">{t('home.hero_section.schedule')}</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3">
                                                        <Trophy className="h-4 w-4 text-emerald-600"/>
                                                        <span className="text-xs font-medium">{t('home.hero_section.my_grades')}: 16.5</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3">
                                                        <Clock className="h-4 w-4 text-amber-600"/>
                                                        <span className="text-xs font-medium">{t('home.hero_section.next_class')}: 14h</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="rounded-[1.75rem] border-0 bg-slate-100 p-5 text-slate-950 shadow-lg">
                                    <h3 className="text-xl font-semibold">
                                        {t('home.hero_section.permanent_access')}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {t('home.hero_section.permanent_access_description')}
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}