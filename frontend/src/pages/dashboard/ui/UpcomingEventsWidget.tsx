import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/ui/'

import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {eventApi} from "@/entities/event/api/event.api";
import {useEffect, useState} from "react";
import {Status} from "@shared/helperClass/CommonResponse";
import {addDays, format, isPast} from "date-fns";
import {useAppSelector} from "@shared/store/hooks";
import {selectSubSchoolId} from "@features/auth/model/selectors";
import {TYPE_CONFIG} from "@entities/event";
import type {SchoolEvent} from "@/pages/event/ui";

interface UpcomingEventItem {
    id: string;
    label: string;
    badgeClasses: string;
    title: string;
    sub: string;
    date: string;
    overdue: boolean;
}
export function UpcomingEventsWidget() {
    const subSchoolId = useAppSelector(selectSubSchoolId);
    const [events, setEvents] = useState<UpcomingEventItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subSchoolId) return;

        const fetchEvents = async () => {
            try {
                const response = await eventApi.getAll({ subSchoolId });

                if (response.status === Status.Success && Array.isArray(response.result)) {
                    const today = new Date();
                    const weekEnd = addDays(today, 7);

                    const upcoming: UpcomingEventItem[] = response.result
                        .filter((e: SchoolEvent) => {
                            const startDate = new Date(e.startDate);
                            return startDate <= weekEnd;
                        })
                        .sort((a: SchoolEvent, b: SchoolEvent) =>
                            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                        )
                        .slice(0, 6)
                        .map((e: SchoolEvent) => {
                            const startDate = new Date(e.startDate);
                            const overdue = isPast(startDate);
                            const config = TYPE_CONFIG[e.type];

                            return {
                                id: e.id,
                                label: config.label,
                                badgeClasses: config.badgeClasses,
                                title: e.title,
                                sub: e.location || config.label,
                                date: overdue ? 'Past' : format(startDate, 'MMM d'),
                                overdue,
                            };
                        });

                    setEvents(upcoming);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [subSchoolId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Upcoming Events</CardTitle>
                            <p className="text-xs text-zinc-400 mt-0.5">Loading...</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            Upcoming Events
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            This week
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1"
                    >
                        <Plus className="h-3 w-3" />
                        New
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {events.length === 0 ? (
                    <div className="text-center text-sm text-zinc-400 py-8">
                        No events this week
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center gap-3 group cursor-pointer"
                        >
                            <div
                                className={cn(
                                    'text-[10px] font-semibold px-2 py-1 rounded-md shrink-0',
                                    event.badgeClasses
                                )}
                            >
                                {event.label}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                                    {event.title}
                                </div>

                                <div className="text-xs text-zinc-400 truncate">
                                    {event.sub}
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div
                                    className={cn(
                                        'text-xs font-semibold',
                                        event.overdue
                                            ? 'text-red-500'
                                            : 'text-zinc-600'
                                    )}
                                >
                                    {event.date}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}