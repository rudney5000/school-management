import {Card, CardContent, CardHeader, CardTitle} from "@shared/ui/card.tsx";

const activityFeed = [
    { icon: '✅', text: '71 students submitted Algorithm Analysis Lab before the deadline.', time: '10 min ago', color: 'text-indigo-500' },
    { icon: '⚠️', text: 'Iris Xavier flagged — score below 50% for 3 consecutive assignments.', time: '25 min ago', color: 'text-orange-500' },
    { icon: '🏅', text: 'Diana Kim scored 98/100 on Unit 3 Quiz — top in class.', time: '40 min ago', color: 'text-green-500' },
    { icon: '💬', text: 'Ravi Varma sent a message regarding the Algorithm Lab submission extension.', time: '1 hr ago', color: 'text-blue-500' },
    { icon: '📖', text: 'Mia Al-Hassan completed all optional reading materials for Chapter 4.', time: '2 hr ago', color: 'text-teal-500' },
    { icon: '📢', text: 'Midterm schedule announcement reached 87 students. 62 acknowledged.', time: 'Yesterday', color: 'text-zinc-400' },
]

export function RecentActivity() {
    return(
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Activity Feed</CardTitle>
                    <button className="text-xs text-indigo-600 hover:underline">All</button>
                </div>
                <p className="text-xs text-zinc-400">Student & class updates · today</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {activityFeed.map((a, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                        <span className="text-sm shrink-0 mt-0.5">{a.icon}</span>
                        <div className="flex-1">
                            <p className="text-xs text-zinc-700 leading-relaxed">{a.text}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{a.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}