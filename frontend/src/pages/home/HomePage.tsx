import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import {Card} from "@shared/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@shared/ui/accordion";
import {
    LayoutGrid,
    Layers3,
    MessageSquare,
    Puzzle,
    ShieldCheck,
    Smartphone,
    Sparkles,
} from "lucide-react";

const features = [
    {
        icon: <Layers3 className="h-5 w-5" />,
        title: "Well organized Layer",
        desc: "Structure claire et scalable pour ton produit.",
    },
    {
        icon: <Sparkles className="h-5 w-5" />,
        title: "Clean & Modern Design",
        desc: "Gros contrastes, espaces généreux et cartes premium.",
    },
    {
        icon: <Puzzle className="h-5 w-5" />,
        title: "Full Customize",
        desc: "Facile à adapter à ta marque et à ton contenu.",
    },
    {
        icon: <LayoutGrid className="h-5 w-5" />,
        title: "1 Screen",
        desc: "Une page forte, lisible et orientée conversion.",
    },
];

const stats = [
    { value: "450+", label: "Positive Reviews" },
    { value: "80%", label: "Daily Progress" },
    { value: "50+", label: "Trusted Companies" },
];

export function HomePage() {
    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950">
            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
                <nav className="mb-10 flex items-center justify-between rounded-full bg-white/70 px-5 py-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                            C
                        </div>
                        <span className="text-2xl font-semibold tracking-tight text-blue-600">
              coca
            </span>
                    </div>

                    <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
                        <a href="#features" className="hover:text-slate-950">
                            Features
                        </a>
                        <a href="#showcase" className="hover:text-slate-950">
                            Showcase
                        </a>
                        <a href="#faq" className="hover:text-slate-950">
                            FAQ
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="rounded-full">
                            Login
                        </Button>
                        <Button className="rounded-full px-6">Sign Up</Button>
                    </div>
                </nav>

                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="space-y-5">
                            <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
                                Available file
                            </Badge>

                            <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                                Epay - Wallet App Landing Page
                            </h1>

                            <p className="max-w-xl text-lg leading-8 text-slate-600">
                                Une homepage moderne, claire et premium, inspirée d’un style
                                mobile-first avec de grandes cartes, des CTA visibles et une
                                hiérarchie forte.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="rounded-full px-8">
                                Get Started
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8">
                                Book a Demo
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
                        <div className="absolute -left-6 top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

                        <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-blue-600 p-6 text-white shadow-[0_30px_80px_rgba(37,99,235,0.35)]">
                            <div className="mb-6 flex items-center justify-between text-sm text-white/80">
                                <span className="font-semibold">coca</span>
                                <span>Trusted by 50+ companies</span>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-[1.75rem] bg-white p-6 text-slate-950 shadow-lg">
                                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                                        <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold">Top Notch Secured</h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Sécurité, fiabilité et confiance pour tes utilisateurs.
                                            </p>
                                        </Card>

                                        <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold">Engage Customers</h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Des écrans qui guident naturellement vers l’action.
                                            </p>
                                        </Card>
                                    </div>

                                    <h2 className="max-w-md text-3xl font-semibold tracking-tight">
                                        We will take care of your everything
                                    </h2>

                                    <div className="mt-6 space-y-3">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="item-1">
                                                <AccordionTrigger>Anti-Loss Technology</AccordionTrigger>
                                                <AccordionContent>
                                                    Protection, stabilité et expérience fluide.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2">
                                                <AccordionTrigger>Exchange Easily</AccordionTrigger>
                                                <AccordionContent>
                                                    Interaction simple et navigation rapide.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-3">
                                                <AccordionTrigger>Fully Encrypted</AccordionTrigger>
                                                <AccordionContent>
                                                    Architecture pensée pour la confiance.
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white p-4 text-slate-950 shadow-lg">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <Smartphone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Mobile Preview</div>
                                                <div className="text-sm text-slate-600">Wallet app mockup</div>
                                            </div>
                                        </div>

                                        <div className="rounded-3xl bg-slate-100 p-4">
                                            <div className="mx-auto h-64 max-w-[220px] rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-700 p-3 text-white shadow-xl">
                                                <div className="h-full rounded-[1.5rem] bg-white p-4 text-slate-950">
                                                    <div className="text-xs text-slate-500">My Task</div>
                                                    <div className="mt-3 space-y-3">
                                                        <div className="h-10 rounded-2xl bg-slate-100" />
                                                        <div className="h-10 rounded-2xl bg-slate-100" />
                                                        <div className="h-10 rounded-2xl bg-blue-100" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="rounded-[1.75rem] border-0 bg-slate-100 p-5 text-slate-950 shadow-lg">
                                        <h3 className="text-xl font-semibold">
                                            Your access anytime, anywhere
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Responsive experience pour desktop et mobile.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            <section id="features" className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {features.map((item) => (
                        <Card key={item.title} className="rounded-3xl border-0 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <section id="showcase" className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-[2rem] border-0 bg-white p-8 shadow-sm">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Built for a strong first impression
                        </h2>
                        <p className="mt-4 text-slate-600">
                            La structure ci-dessus fonctionne très bien pour une landing page
                            produit, SaaS ou wallet app.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Badge variant="secondary" className="rounded-full px-4 py-2">
                                React
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-4 py-2">
                                TypeScript
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-4 py-2">
                                TailwindCSS
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-4 py-2">
                                shadcn/ui
                            </Badge>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-0 bg-blue-600 p-8 text-white shadow-sm">
                        <h2 className="text-3xl font-semibold tracking-tight">Next step</h2>
                        <p className="mt-4 text-white/80">
                            Je peux maintenant te générer la version encore plus fidèle à ton
                            image, avec hero asymétrique, sections superposées et mockups plus
                            réalistes.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button className="rounded-full bg-white px-6 text-blue-600 hover:bg-white/90">
                                Generate premium version
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}