import {GraduationCap} from "lucide-react";

export const EmptyDetailPanel = () => (
    <div className="rounded-2xl border border-border/60 bg-white p-8 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Aucune classe sélectionnée</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
            Sélectionnez une classe dans la liste pour voir les détails
        </p>
    </div>
)