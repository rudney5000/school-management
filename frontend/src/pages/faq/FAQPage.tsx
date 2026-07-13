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
import {useLocaleRoute} from "@shared/lib";

const faqCategories = [
    {
        icon: <Users className="h-5 w-5" />,
        title: "Comptes & Utilisateurs",
        questions: [
            {
                question: "Comment créer un compte sur SchoolHub?",
                answer: "Cliquez sur 'Commencer' en haut à droite, puis suivez les étapes d'inscription. Vous recevrez un email de confirmation pour activer votre compte. Les administrateurs peuvent également créer des comptes pour les élèves et enseignants de leur établissement."
            },
            {
                question: "Comment ajouter plusieurs enfants à un compte parent?",
                answer: "Dans votre espace parent, allez dans 'Mes enfants' puis cliquez sur 'Ajouter un enfant'. Entrez le code fourni par l'établissement de votre enfant. Vous pouvez suivre plusieurs enfants scolarisés dans différents établissements."
            },
            {
                question: "Comment changer mon mot de passe?",
                answer: "Accédez à votre profil en cliquant sur votre avatar, puis 'Paramètres de sécurité' et 'Changer le mot de passe'. Vous recevrez un email de confirmation pour valider le changement."
            },
        ]
    },
    {
        icon: <BookOpen className="h-5 w-5" />,
        title: "Cours & Pédagogie",
        questions: [
            {
                question: "Comment les enseignants publient-ils les cours?",
                answer: "Les enseignants accèdent à leur espace pédagogique, créent un nouveau cours, ajoutent les ressources (documents, vidéos, liens) et le publient. Les élèves reçoivent une notification automatique."
            },
            {
                question: "Les élèves peuvent-ils poser des questions sur les cours?",
                answer: "Oui, chaque cours dispose d'un espace de discussion où les élèves peuvent poser des questions. Les enseignants répondent et les réponses sont visibles par toute la classe."
            },
            {
                question: "Comment suivre la progression des élèves?",
                answer: "Un tableau de bord dédié montre les notes, les devoirs rendus, le temps passé sur chaque module et les statistiques de progression pour chaque élève."
            },
        ]
    },
    {
        icon: <Shield className="h-5 w-5" />,
        title: "Sécurité & Confidentialité",
        questions: [
            {
                question: "Comment sont protégées les données des élèves?",
                answer: "Toutes les données sont cryptées en SSL/TLS. Nous respectons le RGPD et les réglementations sur la protection des mineurs. Les données sont hébergées en Europe avec des sauvegardes quotidiennes."
            },
            {
                question: "Quels sont les différents niveaux d'accès?",
                answer: "Il existe 4 rôles principaux: Administrateur (accès complet), Enseignant (gestion pédagogique), Élève (accès cours et notes), Parent (suivi enfants). Chaque rôle a des permissions spécifiques."
            },
            {
                question: "Puis-je contrôler ce que voient les parents?",
                answer: "Oui, les enseignants et administrateurs peuvent configurer la visibilité des informations: notes détaillées ou moyennes uniquement, commentaires publics ou privés, etc."
            },
        ]
    },
    {
        icon: <CreditCard className="h-5 w-5" />,
        title: "Tarification & Facturation",
        questions: [
            {
                question: "Quels sont les plans tarifaires disponibles?",
                answer: "Nous proposons 3 formules: Essential (jusqu'à 300 élèves), Professional (jusqu'à 1000 élèves) avec analyses avancées, et Enterprise (illimité) avec support dédié. Contactez-nous pour un devis personnalisé."
            },
            {
                question: "Y a-t-il une période d'essai gratuit?",
                answer: "Oui, toutes les formules incluent 30 jours d'essai gratuit sans engagement. Aucune carte bancaire demandée pour la période d'essai."
            },
            {
                question: "Comment se passe la facturation?",
                answer: "Facturation annuelle ou mensuelle au choix. Paiement par carte bancaire, virement ou chèque. Réduction de 15% pour engagement annuel. Factures disponibles dans l'espace administrateur."
            },
        ]
    },
];

const quickLinks = [
    {
        icon: <BookOpen className="h-4 w-4" />,
        title: "Documentation",
        desc: "Guide complet d'utilisation",
        href: "#"
    },
    {
        icon: <Smartphone className="h-4 w-4" />,
        title: "Application Mobile",
        desc: "iOS & Android disponibles",
        href: "#"
    },
    {
        icon: <MessageSquare className="h-4 w-4" />,
        title: "Support en ligne",
        desc: "Chat 24/7 disponible",
        href: "#"
    },
    {
        icon: <Clock className="h-4 w-4" />,
        title: "Webinaires",
        desc: "Formations en direct",
        href: "#"
    },
];

export function FAQPage() {
    const { localeRoute } = useLocaleRoute()
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
                        <Link to="/" className="hover:text-slate-950">
                            Accueil
                        </Link>
                        <Link {...localeRoute("/faq")} className="font-semibold text-blue-600">
                            FAQ
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" className="rounded-full">
                            <Link to="/">Connexion</Link>
                        </Button>
                        <Button asChild className="rounded-full px-6">
                            <Link to="/">Commencer</Link>
                        </Button>
                    </div>
                </nav>

                <div className="mb-12 text-center">
                    <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
                        Centre d'Aide
                    </Badge>
                    <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                        Questions Fréquentes
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                        Retrouvez toutes les réponses à vos questions sur SchoolHub.
                        Notre équipe support est également disponible pour vous aider.
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
                            <h2 className="text-2xl font-semibold">Besoin d'aide?</h2>
                            <p className="mt-3 text-sm text-white/80">
                                Notre équipe support est disponible pour répondre à toutes vos questions.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">Email</div>
                                            <div className="text-sm font-medium">support@schoolhub.com</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">Téléphone</div>
                                            <div className="text-sm font-medium">+33 1 23 45 67 89</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5" />
                                        <div>
                                            <div className="text-xs text-white/70">Horaires</div>
                                            <div className="text-sm font-medium">Lun-Ven: 9h-18h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="mt-6 w-full rounded-full bg-white px-6 text-blue-600 hover:bg-white/90">
                                <Link to="/">Contacter le support</Link>
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
                                            <p className="text-sm text-slate-600">{category.questions.length} questions</p>
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
