
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {Button} from "@shared/ui/button.tsx";
import {Card} from "@shared/ui/card.tsx";

export function NotFoundPage() {
    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950 flex items-center justify-center">
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

                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" className="rounded-full">
                            <Link to="/">Accueil</Link>
                        </Button>
                        <Button asChild className="rounded-full px-6">
                            <Link to="/">Connexion</Link>
                        </Button>
                    </div>
                </nav>

                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-5">
                            <div className="text-[8rem] font-bold leading-none tracking-tighter text-blue-600 opacity-10 sm:text-[10rem]">
                                404
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Page non trouvée
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-slate-600">
                                Oups! La page que vous recherchez semble introuvable.
                                Peut-être a-t-elle été déplacée ou n'existe plus.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link to="/">
                                    <Home className="mr-2 h-5 w-5" />
                                    Retour à l'accueil
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                                <Link to="/">
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    Page précédente
                                </Link>
                            </Button>
                        </div>

                        <div className="rounded-[2rem] border-0 bg-white/50 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Search className="h-5 w-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-slate-950">Vous cherchez quelque chose?</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Utilisez le menu de navigation ou retournez à l'accueil pour trouver votre chemin.
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
                                        Cette page est partie en excursion
                                    </h2>
                                    <p className="mt-3 text-white/80">
                                        Mais ne vous inquiétez pas! Il y a beaucoup à découvrir sur SchoolHub.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">Gestion Scolaire</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            Plateforme complète du primaire au supérieur
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">150+ Établissements</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            Rejoignez notre communauté éducative
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                        <h3 className="font-semibold">Multi-Utilisateurs</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            Élèves, enseignants, parents et administration
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
