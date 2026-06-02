import {Card, CardContent, CardHeader, CardTitle} from "@shared/ui/card";
import {cn} from "@shared/lib/utils.ts";

const classroomPulse = [
    { id: 'A', status: 'high' },
    { id: 'B', status: 'good' },
    { id: 'C', status: 'good' },
    { id: 'D', status: 'good' },
    { id: 'E', status: 'good' },
    { id: 'F', status: 'good' },
    { id: 'G', status: 'good' },
    { id: 'H', status: 'good' },
    { id: 'I', status: 'low' },
    { id: 'J', status: 'good' },
    { id: 'K', status: 'good' },
    { id: 'L', status: 'good' },
    { id: 'M', status: 'good' },
    { id: 'N', status: 'good' },
    { id: 'O', status: 'absent' },
    { id: 'P', status: 'good' },
    { id: 'Q', status: 'good' },
    { id: 'R', status: 'mid' },
    { id: 'S', status: 'good' },
    { id: 'T', status: 'good' },
    { id: 'U', status: 'good' },
    { id: 'V', status: 'good' },
    { id: 'W', status: 'good' },
    { id: 'X', status: 'low' },
    { id: 'Y', status: 'good' },
    { id: 'Z', status: 'good' },
    { id: 'A2', status: 'good' },
    { id: 'B2', status: 'good' },
    { id: 'C2', status: 'good' },
]

const pulseColors: Record<string, string> = {
    high: 'bg-emerald-500',
    good: 'bg-green-400',
    mid: 'bg-amber-400',
    low: 'bg-red-400',
    absent: 'bg-zinc-300',
}


export function ClassroomPulse() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            Classroom Pulse
                        </CardTitle>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            CS101 · Period 3 · Intro to Algorithms · 29 students
                        </p>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                    {classroomPulse.map((student) => (
                        <div
                            key={student.id}
                            title={student.id}
                            className={cn(
                                'aspect-square rounded-md flex items-center justify-center text-white text-[10px] font-bold',
                                pulseColors[student.status]
                            )}
                        >
                            {student.id}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mb-4">
                    {[
                        { key: 'high', label: 'High (15)' },
                        { key: 'good', label: 'Good (8)' },
                        { key: 'mid', label: 'Mid (4)' },
                        { key: 'low', label: 'Low (3)' },
                        { key: 'absent', label: 'Absent (1)' },
                    ].map((item) => (
                        <span
                            key={item.key}
                            className="flex items-center gap-1"
                        >
                            <span
                                className={cn(
                                    'w-2.5 h-2.5 rounded-sm',
                                    pulseColors[item.key]
                                )}
                            />
                            {item.label}
                        </span>
                    ))}
                </div>

                <div className="flex gap-6 pt-3 border-t border-zinc-100">
                    <div>
                        <div className="text-2xl font-bold text-indigo-600">
                            78%
                        </div>
                        <div className="text-xs text-zinc-400 uppercase tracking-wide">
                            Engagement
                        </div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-zinc-800">
                            27/29
                        </div>
                        <div className="text-xs text-zinc-400 uppercase tracking-wide">
                            Present
                        </div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-red-500">
                            3
                        </div>
                        <div className="text-xs text-zinc-400 uppercase tracking-wide">
                            Need Attention
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}