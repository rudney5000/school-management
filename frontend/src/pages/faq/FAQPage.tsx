import {
    HelpCircle,
    MessageSquare,
    BookOpen,
    Users,
    Shield,
    CreditCard,
    Smartphone,
    Clock,
    Mail,
    Phone,
    ChevronRight,
} from "lucide-react";
import {Link} from "@tanstack/react-router";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Badge,
    Button,
    Card
} from "@shared/ui";
import {useTranslation} from "@shared/lib";
import {Navigation} from "@shared/ui";

export function FAQPage() {
    const { t } = useTranslation()

    const faqCategories = [
        {
            icon: <Users className="h-5 w-5" />,
            title: t('faq.categories.accounts.title'),
            questions: [
                {
                    question: t('faq.categories.accounts.questions.createAccount.question'),
                    answer: t('faq.categories.accounts.questions.createAccount.answer')
                },
                {
                    question: t('faq.categories.accounts.questions.addChildren.question'),
                    answer: t('faq.categories.accounts.questions.addChildren.answer')
                },
                {
                    question: t('faq.categories.accounts.questions.changePassword.question'),
                    answer: t('faq.categories.accounts.questions.changePassword.answer')
                },
            ]
        },
        {
            icon: <BookOpen className="h-5 w-5" />,
            title: t('faq.categories.courses.title'),
            questions: [
                {
                    question: t('faq.categories.courses.questions.publishCourses.question'),
                    answer: t('faq.categories.courses.questions.publishCourses.answer')
                },
                {
                    question: t('faq.categories.courses.questions.askQuestions.question'),
                    answer: t('faq.categories.courses.questions.askQuestions.answer')
                },
                {
                    question: t('faq.categories.courses.questions.trackProgress.question'),
                    answer: t('faq.categories.courses.questions.trackProgress.answer')
                },
            ]
        },
        {
            icon: <Shield className="h-5 w-5" />,
            title: t('faq.categories.security.title'),
            questions: [
                {
                    question: t('faq.categories.security.questions.dataProtection.question'),
                    answer: t('faq.categories.security.questions.dataProtection.answer')
                },
                {
                    question: t('faq.categories.security.questions.accessLevels.question'),
                    answer: t('faq.categories.security.questions.accessLevels.answer')
                },
                {
                    question: t('faq.categories.security.questions.parentControl.question'),
                    answer: t('faq.categories.security.questions.parentControl.answer')
                },
            ]
        },
        {
            icon: <CreditCard className="h-5 w-5" />,
            title: t('faq.categories.pricing.title'),
            questions: [
                {
                    question: t('faq.categories.pricing.questions.plans.question'),
                    answer: t('faq.categories.pricing.questions.plans.answer')
                },
                {
                    question: t('faq.categories.pricing.questions.trial.question'),
                    answer: t('faq.categories.pricing.questions.trial.answer')
                },
                {
                    question: t('faq.categories.pricing.questions.billing.question'),
                    answer: t('faq.categories.pricing.questions.billing.answer')
                },
            ]
        },
    ];

    const quickLinks = [
        {
            icon: <BookOpen className="h-4 w-4" />,
            title: t('faq.quickLinks.documentation.title'),
            desc: t('faq.quickLinks.documentation.desc'),
            href: "#"
        },
        {
            icon: <Smartphone className="h-4 w-4" />,
            title: t('faq.quickLinks.mobileApp.title'),
            desc: t('faq.quickLinks.mobileApp.desc'),
            href: "#"
        },
        {
            icon: <MessageSquare className="h-4 w-4" />,
            title: t('faq.quickLinks.support.title'),
            desc: t('faq.quickLinks.support.desc'),
            href: "#"
        },
        {
            icon: <Clock className="h-4 w-4" />,
            title: t('faq.quickLinks.webinars.title'),
            desc: t('faq.quickLinks.webinars.desc'),
            href: "#"
        },
    ];
    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950">
            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
                <Navigation />

                <div className="mb-12 text-center">
                    <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
                        {t('faq.hero.badge')}
                    </Badge>
                    <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                        {t('faq.hero.title')}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                        {t('faq.hero.description')}
                    </p>
                </div>

                <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickLinks.map((link) => (
                        <Card key={link.title} className="group cursor-pointer rounded-3xl border-0 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    {link.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-950">{link.title}</h3>
                                    <p className="text-xs text-slate-600">{link.desc}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 rounded-[2rem] border-0 bg-blue-600 p-6 text-white shadow-[0_20px_60px_rgba(37,99,235,0.25)]">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                                <HelpCircle className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-semibold">{t('faq.support.title')}</h2>
                            <p className="mt-3 text-sm text-white/80">
                                {t('faq.support.description')}
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">{t('faq.support.email')}</div>
                                            <div className="text-sm font-medium">support@schoolhub.com</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">{t('faq.support.phone')}</div>
                                            <div className="text-sm font-medium">+33 1 23 45 67 89</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">{t('faq.support.hours')}</div>
                                            <div className="text-sm font-medium">Lun-Ven: 9h-18h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="mt-6 w-full rounded-full bg-white px-6 text-blue-600 hover:bg-white/90">
                                <Link to="/">{t('faq.support.contactButton')}</Link>
                            </Button>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {faqCategories.map((category) => (
                                <Card key={category.title} className="rounded-[2rem] border-0 bg-white p-6 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">{category.title}</h2>
                                            <p className="text-sm text-slate-600">{t('faq.questionsCount', { count: category.questions.length })}</p>
                                        </div>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full space-y-3">
                                        {category.questions.map((item, idx) => (
                                            <AccordionItem
                                                key={idx}
                                                value={`${category.title}-${idx}`}
                                                className="rounded-2xl border-0 bg-slate-50 px-6 data-[state=open]:bg-blue-50"
                                            >
                                                <AccordionTrigger className="text-left hover:no-underline">
                                                    <div className="flex items-center gap-3 pr-4">
                                                        <HelpCircle className="h-4 w-4 shrink-0 text-blue-600" />
                                                        <span className="font-medium text-slate-950">{item.question}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
