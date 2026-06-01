import {HeroSection} from "@/pages/home/ui/HeroSection.tsx";
import {UsersSection} from "@/pages/home/ui/UsersSection.tsx";
import {ShowcaseSection} from "@/pages/home/ui/ShowcaseSection.tsx";
import {FeaturesSection} from "@/pages/home/ui/FeaturesSection.tsx";

export function HomePage() {
    return (
        <main className="min-h-screen bg-[#eef1f7] text-slate-950">
            <HeroSection/>
            <UsersSection/>
            <FeaturesSection/>
            <ShowcaseSection/>
        </main>
    );
}