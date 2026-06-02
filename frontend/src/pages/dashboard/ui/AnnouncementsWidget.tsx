import {Card, CardContent, CardHeader, CardTitle} from "@shared/ui/card.tsx";
import {cn} from "@shared/lib/utils.ts";

const announcements = [
    {
        icon: '📋',
        title: 'Midterm Exams — April 18–20',
        desc: 'Midterm exams are scheduled next week. CS101 exam is on April 19, 8AM. Study guides posted on course page.',
        meta: 'Posted by you · 2 days ago',
        color: 'bg-zinc-100',
    },
    {
        icon: '📌',
        title: 'CS102 Lab Session Moved',
        desc: "This Friday's lab session is moved to Room 208 due to equipment maintenance in Rm 204.",
        meta: 'Posted by you · Today, 8:03am',
        color: 'bg-zinc-100',
    },
    {
        icon: '🏆',
        title: 'Hackathon Signup Open',
        desc: 'School Coding Hackathon May 3. Teams of 2–4. CS students get bonus project credit. Sign up by Apr 20.',
        meta: 'School-IT · 3 days ago',
        color: 'bg-amber-50',
    },
]

export function AnnouncementsWidget() {
    return(
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Announcements</CardTitle>
                    <button className="text-xs text-indigo-600 hover:underline">View All</button>
                </div>
                <p className="text-xs text-zinc-400">Posted to your classes</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {announcements.map((a, i) => (
                    <div key={i} className={cn('rounded-lg p-3', a.color)}>
                        <div className="flex gap-2 items-start">
                            <span className="text-base shrink-0">{a.icon}</span>
                            <div>
                                <div className="text-sm font-semibold text-zinc-800">{a.title}</div>
                                <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{a.desc}</div>
                                <div className="text-[10px] text-zinc-400 mt-1.5">{a.meta}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}