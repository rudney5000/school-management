import {
    useState
} from "react"
import {
    format,
    startOfWeek,
    addWeeks,
    addDays,
    isBefore
} from "date-fns"
import {
    TYPE_CONFIG,
    useEvents,
    useCreateEvent,
    useDeleteEvent,
    type Event
} from "@entities/event";
import {
    AvatarStack,
    buildGanttItems,
    WEEK_COUNT
} from "@/pages/event/ui";
import {
    Plus,
    Clock,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Trash2,
    Radio,
    Copy,
    ExternalLink,
} from "lucide-react"
import {
    Badge,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Skeleton,
} from "@/shared/ui"
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useAppSelector } from "@shared/store/hooks"
import {cn, useTranslation} from "@shared/lib";
import {useDateLocale} from "@shared/lib/date";
import {AddEventForm, DeleteAlertEvent, EditEventForm} from "@features/event";

export default function EventsPage() {
    const [search, _setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const [windowOffset, setWindowOffset] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editDrawerOpen, setEditDrawerOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
    const { t } = useTranslation()
    const dateLocale = useDateLocale()

    const selectedSubSchoolId = useAppSelector((state) => state.subSchool.selectedSubSchoolId)
    
    const { data: events = [], isLoading: loading } = useEvents(selectedSubSchoolId || undefined)
    const createEventMutation = useCreateEvent()
    const deleteEventMutation = useDeleteEvent()


    const ganttWindowStart = (() => {
        const base =
            events.length > 0
                ? startOfWeek(new Date(events[0].startDate), {weekStartsOn: 1})
                : startOfWeek(new Date(), {weekStartsOn: 1})
        return addWeeks(base, windowOffset)
    })()

    const weekHeaders = Array.from({length: WEEK_COUNT}, (_, i) => {
        const d = addDays(ganttWindowStart, i * 7)
        return {
            label: format(d, "dd", { locale: dateLocale }),
            sub: format(d, "EEE", { locale: dateLocale }),
        }
    })

    const filteredEvents = search
        ? events.filter(
            (e) =>
                e.title.toLowerCase().includes(search.toLowerCase()) ||
                (e.type ?? "").toLowerCase().includes(search.toLowerCase())
        )
        : events

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const diff =
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        return sortOrder === "newest" ? -diff : diff
    })

    const ganttItems = buildGanttItems(sortedEvents, ganttWindowStart)
    const ganttRowCount = Math.max(1, ...ganttItems.map((it) => it.row))

    const now = new Date()
    const pastEvents = events
        .filter((e) => isBefore(new Date(e.endDate), now))
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
        .slice(0, 4)

    const upcomingEvents = events
        .filter((e) => !isBefore(new Date(e.endDate), now))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5)

    const handleAddEvent = async (data: any) => {
        try {
            await createEventMutation.mutateAsync({
                title: data.title,
                description: data.description || "",
                type: data.type,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                location: data.location || "",
                isPublic: data.isPublic,
                subSchoolId: data.subSchoolId,
                isLiveEvent: data.isLiveEvent,
                liveUrl: data.liveUrl,
            })
            setDrawerOpen(false)
        } catch (e) {
            console.error(e)
        }
    }

    const handleEditEvent = async (data: any) => {
        if (!editingEvent) return
        try {
            await createEventMutation.mutateAsync({
                title: data.title,
                description: data.description || "",
                type: data.type,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                location: data.location || "",
                isPublic: data.isPublic,
                subSchoolId: data.subSchoolId,
                isLiveEvent: data.isLiveEvent,
                liveUrl: data.liveUrl,
            })
            setEditDrawerOpen(false)
            setEditingEvent(null)
        } catch (e) {
            console.error(e)
        }
    }

    const handleDeleteClick = (id: string) => {
        setDeletingEventId(id)
        setDeleteAlertOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingEventId || !selectedSubSchoolId) return
        await deleteEventMutation.mutateAsync({ id: deletingEventId, subSchoolId: selectedSubSchoolId })
        setDeleteAlertOpen(false)
        setDeletingEventId(null)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.events.title')}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {t('dashboard.events.welcome')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Select
                                value={sortOrder}
                                onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">{t('dashboard.events.newest')}</SelectItem>
                                    <SelectItem value="oldest">{t('dashboard.events.oldest')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                className="text-white gap-2"
                                style={{ background: "oklch(0.50 0.22 275)" }}
                                onClick={() => setDrawerOpen(true)}
                            >
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">{t('dashboard.events.addEvent')}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative overflow-hidden rounded-2xl bg-sky-50 border border-sky-100 p-5 flex items-center gap-5 min-h-[100px]">
                            <div>
                                <p className="text-xs text-sky-500 font-semibold uppercase tracking-wide mb-1">
                                    {t('dashboard.events.schoolEvents')}
                                </p>
                                {loading ? (
                                    <Skeleton className="h-5 w-24 mb-1" />
                                ) : (
                                    <p className="font-bold text-sky-900 text-base leading-tight">
                                        {`${events.length} ${t('dashboard.events.titleWithoutS')}${events.length !== 1 ? 's' : ''}`}
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    {!loading &&
                                        [...new Set(events.map((e) => e.type))]
                                            .slice(0, 3)
                                            .map((t) => (
                                                <Badge
                                                    key={t}
                                                    className={cn("text-[10px] px-1.5", TYPE_CONFIG[t].badgeClasses)}
                                                >
                                                    {TYPE_CONFIG[t].label}
                                                </Badge>
                                            ))}
                                </div>
                            </div>
                            <div className="absolute right-4 bottom-0 text-6xl select-none opacity-25">
                                🏫
                            </div>
                        </div>

                        <div
                            className="relative overflow-hidden rounded-2xl p-5 text-white min-h-[100px]"
                            style={{
                                background:
                                    "linear-gradient(130deg, oklch(0.55 0.25 280) 0%, oklch(0.45 0.20 300) 100%)",
                            }}
                        >
                            <p className="font-bold text-lg leading-tight mb-1">{t('dashboard.events.hello')}</p>
                            <p className="text-sm leading-relaxed max-w-xs opacity-80">
                                {upcomingEvents.length > 0
                                    ? `${t('dashboard.events.nextEvent')} : ${upcomingEvents[0].title} le ${format(new Date(upcomingEvents[0].startDate), "dd MMM yyyy", { locale: dateLocale })}.`
                                    : `${t('dashboard.events.noUpcomingEvents')}`}
                            </p>
                            <div className="absolute right-6 bottom-2 text-5xl select-none opacity-20">
                                🌟
                            </div>
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border p-5 mb-6 overflow-x-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <h2
                                className="font-semibold text-base"
                                style={{ color: "oklch(0.45 0.18 280)" }}
                            >
                                {t('dashboard.events.calendar.title')}
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => setWindowOffset((o) => o - 1)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground px-2 min-w-[130px] text-center">
                                    {format(ganttWindowStart, "dd MMM", { locale: dateLocale })} –{" "}
                                                    {format(addDays(ganttWindowStart, WEEK_COUNT * 7 - 1), "dd MMM yyyy", { locale: dateLocale })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => setWindowOffset((o) => o + 1)}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="min-w-[600px]">
                            <div
                                className="grid mb-2"
                                style={{ gridTemplateColumns: `repeat(${WEEK_COUNT}, 1fr)` }}
                            >
                                {weekHeaders.map((w, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-sm font-semibold">{w.label}</p>
                                        <p className="text-[11px] text-muted-foreground">{w.sub}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="relative">
                                <div
                                    className="absolute inset-0 grid pointer-events-none"
                                    style={{ gridTemplateColumns: `repeat(${WEEK_COUNT}, 1fr)` }}
                                >
                                    {Array.from({ length: WEEK_COUNT }).map((_, i) => (
                                        <div key={i} className="border-l border-border/40 h-full" />
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="space-y-2 py-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                        ))}
                                    </div>
                                ) : ganttItems.length === 0 ? (
                                    <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                                        {t('dashboard.events.noEventsInPeriod')}.
                                    </div>
                                ) : (
                                    Array.from({ length: ganttRowCount }).map((_, rowIdx) => {
                                        const row = rowIdx + 1
                                        const rowEvts = ganttItems.filter((it) => it.row === row)
                                        return (
                                            <div key={rowIdx} className="relative h-11 mb-1.5">
                                                {rowEvts.map((it) => {
                                                    const cfg = TYPE_CONFIG[it.event.type] ?? TYPE_CONFIG.OTHER
                                                    return (
                                                        <div
                                                            key={it.event.id}
                                                            className={cn(
                                                                "absolute inset-y-0 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium overflow-hidden cursor-pointer",
                                                                cfg.colorClasses
                                                            )}
                                                            style={{
                                                                left: `calc(${(it.startCol / WEEK_COUNT) * 100}% + 3px)`,
                                                                width: `calc(${(it.span / WEEK_COUNT) * 100}% - 6px)`,
                                                            }}
                                                            title={`${it.event.title} — ${format(new Date(it.event.startDate), "dd MMM HH:mm")} → ${format(new Date(it.event.endDate), "HH:mm")}`}
                                                        >
                                                          <span className="flex-1 min-w-0 truncate">
                                                            {it.event.title}
                                                          </span>
                                                          <span className="shrink-0 flex items-center gap-1">
                                                            <AvatarStack seed={it.event.id} />
                                                          </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">{t('dashboard.events.recentPastEvents')}</h2>
                            <Button
                                variant="link"
                                className="p-0 h-auto text-sm"
                                style={{ color: "oklch(0.50 0.22 275)" }}
                            >
                                {t('dashboard.events.viewAll')}
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-28 rounded-xl" />
                                ))}
                            </div>
                        ) : pastEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t('dashboard.events.noPastEvents')}.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {pastEvents.map((ev) => {
                                    const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.OTHER
                                    return (
                                        <div key={ev.id} className="bg-background rounded-xl border p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {format(new Date(ev.startDate), "dd MMM", { locale: dateLocale })}
                                                </div>
                                                <button
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                    onClick={() => handleDeleteClick(ev.id)}
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm mb-1 line-clamp-1">
                                                {ev.title}
                                            </p>
                                            <Badge
                                                className={cn("text-[10px] px-1.5 mb-2", cfg.badgeClasses)}
                                            >
                                                {cfg.label}
                                            </Badge>
                                            {ev.isLiveEvent && ev.liveUrl && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Radio className="w-3 h-3 text-red-500" />
                                                    <span className="text-xs font-medium text-red-600">Live disponible</span>
                                                    <div className="ml-auto flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => window.open(ev.liveUrl!, '_blank')}
                                                            title="Ouvrir le live"
                                                        >
                                                            <ExternalLink size={11} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => navigator.clipboard.writeText(ev.liveUrl!)}
                                                            title="Copier le lien"
                                                        >
                                                            <Copy size={11} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            <AvatarStack seed={ev.id} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>

                <aside className="hidden lg:block w-60 shrink-0 border-l bg-background overflow-auto p-4">
                    <div className="mb-4">
                        <h3 className="font-semibold">{t('dashboard.events.eventList')}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('dashboard.events.nextEvents')}
                        </p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 rounded-lg" />
                            ))}
                        </div>
                    ) : upcomingEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t('dashboard.events.noUpcomingEvents')}.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {upcomingEvents.map((ev, i) => {
                                const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.OTHER
                                return (
                                    <div key={ev.id}>
                                        <p className="text-[11px] font-semibold text-orange-500 mb-1">
                                            {format(new Date(ev.startDate), "dd-MMMM, yyyy", { locale: dateLocale })}
                                        </p>
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="font-semibold text-sm leading-tight line-clamp-1">
                                                {ev.title}
                                            </p>
                                            <button
                                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                                                onClick={() => handleDeleteClick(ev.id)}
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="size-3 shrink-0" />
                                            {format(new Date(ev.startDate), "HH:mm", { locale: dateLocale })}
                                            {" – "}
                                            {format(new Date(ev.endDate), "HH:mm", { locale: dateLocale })}
                                        </div>
                                        {ev.location && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <MapPin className="size-3 shrink-0" />
                                                <span className="truncate">{ev.location}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 flex gap-1 flex-wrap">
                                            <Badge className={cn("text-[10px] px-1.5", cfg.badgeClasses)}>
                                                {cfg.label}
                                            </Badge>
                                            {ev.isPublic && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5">
                                                    Public
                                                </Badge>
                                            )}
                                        </div>
                                        {i < upcomingEvents.length - 1 && (
                                            <Separator className="mt-3" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full mt-5 text-sm border-violet-200 hover:bg-violet-50"
                        style={{ color: "oklch(0.50 0.22 275)" }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <Plus className="size-3.5 mr-1" />
                        {t('dashboard.events.addEvent')}
                    </Button>
                </aside>
            </div>

    <CustomDrawer
        isOpen={drawerOpen}
        handleOpen={(open) => setDrawerOpen(open)}
        drawerTitle={`${t('dashboard.events.title')}`}
        drawerDescription={`${t('dashboard.events.createEvent')}`}
        direction="right"
    >
        <AddEventForm
            subSchoolId={selectedSubSchoolId || undefined}
            onSubmit={handleAddEvent}
            onCancel={() => setDrawerOpen(false)}
            isPending={createEventMutation.isPending}
        />
    </CustomDrawer>

    <CustomDrawer
        isOpen={editDrawerOpen}
        handleOpen={(open) => setEditDrawerOpen(open)}
        drawerTitle={`${t('dashboard.events.editEvent')}`}
        drawerDescription={`${t('dashboard.events.editEventDescription')}`}
        direction="right"
    >
        {editingEvent && (
            <EditEventForm
                event={editingEvent}
                subSchoolId={selectedSubSchoolId || undefined}
                onSubmit={handleEditEvent}
                onCancel={() => {
                    setEditDrawerOpen(false)
                    setEditingEvent(null)
                }}
                isPending={createEventMutation.isPending}
            />
        )}
    </CustomDrawer>

    <DeleteAlertEvent
        isOpen={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onClick={handleDeleteConfirm}
        isLoading={deleteEventMutation.isPending}
        eventName={deletingEventId ? events.find(e => e.id === deletingEventId)?.title : undefined}
    />
</div>
    )

}
