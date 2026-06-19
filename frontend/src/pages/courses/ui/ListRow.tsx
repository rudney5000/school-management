import type {Course} from "@entities/courses";
import {Badge, Button} from "@shared/ui";
import {Trash2} from "lucide-react";

export function ListRow({ course, onEdit, onDelete }: { course: Course; onEdit: (c: Course) => void; onDelete: (id: string) => void }) {
    return (
        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
                {course.name[0]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{course.name}</span>
                    <Badge variant="secondary" className="text-[11px] px-2 py-0 shrink-0">{course.code}</Badge>
                </div>
                {course.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{course.description}</p>
                )}
            </div>
            {course.teacher && (
                <span className="text-xs text-muted-foreground shrink-0 hidden md:block">{course.teacher.firstName}</span>
            )}
            <span className="text-sm font-semibold shrink-0">{course.credits} cr.</span>
            <Badge
                variant={course.status === 'completed' ? 'success' : course.status === 'archived' ? 'muted' : 'blue'}
                className="shrink-0"
            >
                {course.status === 'active' ? 'Actif' : course.status === 'completed' ? 'Terminé' : 'Archivé'}
            </Badge>
            <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onEdit(course)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(course.id)}>
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
}
