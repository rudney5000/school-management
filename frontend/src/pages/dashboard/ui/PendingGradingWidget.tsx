import {Card, CardContent, CardHeader, CardTitle} from "@shared/ui/card.tsx";
import {cn} from "@shared/lib/utils.ts";

const pendingGrading = [
    { initials: 'U3', label: 'Unit 3 Quiz — Variables', sub: 'CS101 · Auto-graded', badge: 'Urgent', badgeColor: 'bg-red-100 text-red-600', color: 'bg-indigo-500' },
    { initials: 'AL', label: 'Algorithm Analysis Lab', sub: 'CS101 · Manual grading needed', badge: 'Due Today', badgeColor: 'bg-orange-100 text-orange-600', color: 'bg-teal-500' },
    { initials: 'WD', label: 'CSS Grid Portfolio', sub: 'CS102 · Design review', badge: 'Apr 12', badgeColor: 'bg-zinc-100 text-zinc-500', color: 'bg-green-500' },
    { initials: 'BT', label: 'Binary Tree Lab', sub: 'CS201 · Code review', badge: 'Apr 14', badgeColor: 'bg-zinc-100 text-zinc-500', color: 'bg-blue-500' },
]

export function PendingGradingWidget() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Pending Grading</CardTitle>
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">12 pending</span>
                </div>
                <p className="text-xs text-zinc-400">Submissions awaiting review</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {pendingGrading.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn('w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold', g.color)}>
                            {g.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-800 group-hover:text-indigo-600 transition-colors truncate">
                                {g.label}
                            </div>
                            <div className="text-xs text-zinc-400">{g.sub}</div>
                        </div>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', g.badgeColor)}>
                            {g.badge}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}