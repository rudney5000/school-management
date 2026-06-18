import {
    useEffect,
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
    EventType,
    EVENT_TYPES,
    TYPE_CONFIG,
    useEvents,
    useCreateEvent,
    useDeleteEvent
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
} from "lucide-react"
import {
    Badge,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Skeleton,
    Switch,
    Textarea,
} from "@/shared/ui"
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useAppSelector } from "@shared/store/hooks"
import {cn, useTranslation} from "@shared/lib";

interface EventFormState {
    title: string
    description: string
    type: EventType
    startDate: string
    endDate: string
    location: string
    isPublic: boolean
    subSchoolId: string
}

const EMPTY_FORM: EventFormState = {
    title: "",
    description: "",
    type: EventType.OTHER,
    startDate: "",
    endDate: "",
    location: "",
    isPublic: true,
    subSchoolId: "",
}

export default function EventsPage() {
    const [search, _setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const [windowOffset, setWindowOffset] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [form, setForm] = useState<EventFormState>(EMPTY_FORM)
    const { t } = useTranslation()

    const selectedSubSchoolId = useAppSelector((state) => state.subSchool.selectedSubSchoolId)
    
    const { data: events = [], isLoading: loading } = useEvents(selectedSubSchoolId || undefined)
    const createEventMutation = useCreateEvent()
    const deleteEventMutation = useDeleteEvent()

    useEffect(() => {
        if (selectedSubSchoolId) {
            setForm((prev) => ({ ...prev, subSchoolId: selectedSubSchoolId }))
        }
    }, [selectedSubSchoolId])

    const ganttWindowStart = (() => {
        const base =
            events.length > 0
                ? startOfWeek(new Date(events[0].startDate), {weekStartsOn: 1})
                : startOfWeek(new Date(), {weekStartsOn: 1})
        return addWeeks(base, windowOffset)
    })()

    const weekHeaders = Array.from({length: WEEK_COUNT}, (_, i) => {
        const d = addDays(ganttWindowStart, i * 7)
        return {label: format(d, "dd"), sub: format(d, "EEE")}
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

    const handleAddEvent = async () => {
        if (!form.title || !form.startDate || !form.endDate || !form.subSchoolId) return
        try {
            await createEventMutation.mutateAsync({
                title: form.title,
                description: form.description || "",
                type: form.type,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                location: form.location || "",
                isPublic: form.isPublic,
                subSchoolId: form.subSchoolId,
            })
            setForm(EMPTY_FORM)
            setDrawerOpen(false)
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!selectedSubSchoolId) return
        await deleteEventMutation.mutateAsync({ id, subSchoolId: selectedSubSchoolId })
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-start justify-between mb-5">
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
                                {t('dashboard.events.addEvent')}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
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
                                    ? `${t('dashboard.events.nextEvent')} : ${upcomingEvents[0].title} le ${format(new Date(upcomingEvents[0].startDate), "dd MMM yyyy")}.`
                                    : `${t('dashboard.events.noUpcomingEvents')}`}
                            </p>
                            <div className="absolute right-6 bottom-2 text-5xl select-none opacity-20">
                                🌟
                            </div>
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2
                                className="font-semibold text-base"
                                style={{ color: "oklch(0.45 0.18 280)" }}
                            >
                                {t('dashboard.events.calendar.calendar')}
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
                                    {format(ganttWindowStart, "dd MMM")} –{" "}
                                                    {format(addDays(ganttWindowStart, WEEK_COUNT * 7 - 1), "dd MMM yyyy")}
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
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-28 rounded-xl" />
                                ))}
                            </div>
                        ) : pastEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t('dashboard.events.noPastEvents')}.
                            </p>
                        ) : (
                            <div className="grid grid-cols-4 gap-3">
                                {pastEvents.map((ev) => {
                                    const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.OTHER
                                    return (
                                        <div key={ev.id} className="bg-background rounded-xl border p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {format(new Date(ev.startDate), "dd MMM")}
                                                </div>
                                                <button
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                    onClick={() => handleDelete(ev.id)}
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
                                            <AvatarStack seed={ev.id} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>

                <aside className="w-60 shrink-0 border-l bg-background overflow-auto p-4">
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
                                            {format(new Date(ev.startDate), "dd-MMMM, yyyy")}
                                        </p>
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="font-semibold text-sm leading-tight line-clamp-1">
                                                {ev.title}
                                            </p>
                                            <button
                                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                                                onClick={() => handleDelete(ev.id)}
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="size-3 shrink-0" />
                                            {format(new Date(ev.startDate), "HH:mm")}
                                            {" – "}
                                            {format(new Date(ev.endDate), "HH:mm")}
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
        <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
                <Label htmlFor="ev-title">Titre *</Label>
                <Input
                    id="ev-title"
                    placeholder="Ex: Tournoi Inter-Classes de Football"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="ev-desc">Description</Label>
                <Textarea
                    id="ev-desc"
                    placeholder={`${t('dashboard.events.descriptionPlaceholder')}`}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>

            <div className="grid gap-1.5">
                <Label>{t('dashboard.events.type')}</Label>
                <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v as EventType })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                                {TYPE_CONFIG[t].label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                    <Label htmlFor="ev-start">{t('dashboard.events.start')}</Label>
                    <Input
                        id="ev-start"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="ev-end">{t('dashboard.events.end')}</Label>
                    <Input
                        id="ev-end"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="ev-location">{t('dashboard.events.location')}</Label>
                <Input
                    id="ev-location"
                    placeholder={`${t('dashboard.events.locationPlaceholder')}`}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">{t('dashboard.events.publicEvent')}</p>
                    <p className="text-xs text-muted-foreground">
                        {t('dashboard.events.publicEventDescription')}
                    </p>
                </div>
                <Switch
                    checked={form.isPublic}
                    onCheckedChange={(v) => setForm({ ...form, isPublic: v })}
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        setForm(EMPTY_FORM)
                        setDrawerOpen(false)
                    }}
                >
                    {t('dashboard.common.cancel')}
                </Button>
                <Button
                    disabled={createEventMutation.isPending || !form.title || !form.startDate || !form.endDate || !form.subSchoolId}
                    onClick={handleAddEvent}
                    style={{ background: "oklch(0.50 0.22 275)" }}
                    className="text-white flex-1"
                >
                    {
                        createEventMutation.isPending
                            ? `${t('dashboard.events.confirm')} : ${t('dashboard.events.addEvent')}`
                            : t('dashboard.events.addEvent')
                    }
                </Button>
            </div>
        </div>
    </CustomDrawer>
</div>
    )

}
