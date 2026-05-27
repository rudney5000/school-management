import {
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    ShieldCheck,
    BarChart3,
    MessageSquare,
    Trophy,
    Clock,
    Sparkles,
    LayoutGrid,
    Layers3,
    Puzzle,
    Smartphone,
} from "lucide-react";
import {Button} from "@shared/ui/button.tsx";
import {Badge} from "@shared/ui/badge.tsx";
import {Card} from "@shared/ui/card.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@shared/ui/accordion.tsx";
import {Link} from "@tanstack/react-router";

const features = [
    {
        icon: <Layers3 className="h-5 w-5" />,
        title: "Multi-Level Management",
        desc: "Gestion seamless du primaire au superieur.",
    },
    {
        icon: <Sparkles className="h-5 w-5" />,
        title: "Modern Learning",
        desc: "Interface intuitive et experience premium.",
    },
    {
        icon: <Puzzle className="h-5 w-5" />,
        title: "Fully Customizable",
        desc: "Adaptez la platforme a votre etablissement.",
    },
    {
        icon: <LayoutGrid className="h-5 w-5" />,
        title: "All-in-One Platform",
        desc: "Une solution complete pour toute l'ecole.",
    },
];

const stats = [
    { value: "150+", label: "Etablissements" },
    { value: "50K+", label: "Eleves Actifs" },
    { value: "98%", label: "Satisfaction" },
];

const userTypes = [
    {
        icon: <GraduationCap className="h-5 w-5" />,
        title: "Eleves",
        desc: "Acces aux cours, notes et emploi du temps en temps reel.",
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        icon: <Users className="h-5 w-5" />,
        title: "Enseignants",
        desc: "Gestion des classes, publication des notes et suivi pedagogique.",
        color: "bg-blue-100 text-blue-600",
    },
    {
        icon: <BookOpen className="h-5 w-5" />,
        title: "Parents",
        desc: "Suivi des progres et communication directe avec l'ecole.",
        color: "bg-amber-100 text-amber-600",
    },
    {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Administration",
        desc: "Tableau de bord complet pour une gestion efficace.",
        color: "bg-rose-100 text-rose-600",
    },
];

export function HomePage() {
    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950">
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
                            Fonctionnalites
                        </a>
                        <a href="#users" className="hover:text-slate-950">
                            Utilisateurs
                        </a>
                        <Link to="/faq" className="hover:text-slate-950">
                            FAQ
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="rounded-full">
                            Connexion
                        </Button>
                        <Button className="rounded-full px-6">Commencer</Button>
                    </div>
                </nav>

                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="space-y-5">
                            <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
                                Disponible maintenant
                            </Badge>

                            <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                                La plateforme scolaire complete
                            </h1>

                            <p className="max-w-xl text-lg leading-8 text-slate-600">
                                Gerez tous les niveaux d'education sur une seule plateforme moderne.
                                Du primaire au superieur, chaque acteur trouve sa place.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="rounded-full px-8">
                                Demarrer gratuitement
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8">
                                Voir la demo
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
                                <span className="font-semibold">SchoolHub</span>
                                <span>150+ etablissements nous font confiance</span>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-[1.75rem] bg-white p-6 text-slate-950 shadow-lg">
                                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                                        <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold">Securite Garantie</h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Donnees protegees et confidentialite respectee.
                                            </p>
                                        </Card>

                                        <Card className="rounded-2xl border-0 bg-slate-50 p-4 shadow-none">
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold">Communication Fluide</h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Echanges instantanes entre tous les acteurs.
                                            </p>
                                        </Card>
                                    </div>

                                    <h2 className="max-w-md text-3xl font-semibold tracking-tight">
                                        Tout pour reussir l'annee scolaire
                                    </h2>

                                    <div className="mt-6 space-y-3">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="item-1">
                                                <AccordionTrigger>Suivi des Notes en temps reel</AccordionTrigger>
                                                <AccordionContent>
                                                    Visualisez les progres et les performances instantanement.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2">
                                                <AccordionTrigger>Emploi du Temps Interactif</AccordionTrigger>
                                                <AccordionContent>
                                                    Planning personnalise et notifications automatiques.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-3">
                                                <AccordionTrigger>Espace de Cours Digital</AccordionTrigger>
                                                <AccordionContent>
                                                    Ressources pedagogiques accessibles partout.
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
                                                <div className="font-semibold">Application Mobile</div>
                                                <div className="text-sm text-slate-600">Disponible iOS & Android</div>
                                            </div>
                                        </div>

                                        <div className="rounded-3xl bg-slate-100 p-4">
                                            <div className="mx-auto h-64 max-w-[220px] rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-700 p-3 text-white shadow-xl">
                                                <div className="h-full rounded-[1.5rem] bg-white p-4 text-slate-950">
                                                    <div className="text-xs text-slate-500">Mon Espace</div>
                                                    <div className="mt-3 space-y-3">
                                                        <div className="flex items-center gap-2 rounded-2xl bg-blue-50 p-3">
                                                            <Calendar className="h-4 w-4 text-blue-600" />
                                                            <span className="text-xs font-medium">Emploi du temps</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3">
                                                            <Trophy className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-xs font-medium">Mes notes: 16.5</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3">
                                                            <Clock className="h-4 w-4 text-amber-600" />
                                                            <span className="text-xs font-medium">Prochain cours: 14h</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="rounded-[1.75rem] border-0 bg-slate-100 p-5 text-slate-950 shadow-lg">
                                        <h3 className="text-xl font-semibold">
                                            Acces permanent, partout
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Compatible desktop, tablette et mobile pour tous.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            <section id="users" className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight">
                        Une plateforme pour tous
                    </h2>
                    <p className="mt-2 text-slate-600">
                        Chaque acteur de l'education trouve son espace dedie.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {userTypes.map((item) => (
                        <Card key={item.title} className="group rounded-3xl border-0 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                            <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-full", item.color)}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                        </Card>
                    ))}
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
                            Concu pour l'education moderne
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Notre plateforme s'adapte a tous les niveaux: maternelle, primaire,
                            college, lycee et enseignement superieur. Chaque etablissement trouve
                            son modele ideal.
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
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Pret a transformer votre etablissement?
                        </h2>
                        <p className="mt-4 text-white/80">
                            Rejoignez plus de 150 etablissements qui font confiance a SchoolHub
                            pour moderniser leur gestion scolaire et ameliorer l'experience educative.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button className="rounded-full bg-white px-6 text-blue-600 hover:bg-white/90">
                                Demander une demo
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
