import { useState, useEffect } from "react"
import { EventType, EVENT_TYPES, TYPE_CONFIG, type Event } from "@entities/event"
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from "@shared/ui"
import { useTranslation } from "@shared/lib"

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

interface EditEventFormProps {
    event: Event
    subSchoolId?: string
    onSubmit: (data: EventFormState) => Promise<void>
    onCancel: () => void
    isPending?: boolean
}

export function EditEventForm({ event, subSchoolId, onSubmit, onCancel, isPending }: EditEventFormProps) {
    const [form, setForm] = useState<EventFormState>({
        title: event.title,
        description: event.description || "",
        type: event.type,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isPublic: event.isPublic,
        subSchoolId: subSchoolId || event.subSchoolId,
    })
    const { t } = useTranslation()

    useEffect(() => {
        if (subSchoolId) {
            setForm((prev) => ({ ...prev, subSchoolId }))
        }
    }, [subSchoolId])

    const handleSubmit = async () => {
        if (!form.title || !form.startDate || !form.endDate || !form.subSchoolId) return
        await onSubmit(form)
    }

    return (
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
                    placeholder={t('dashboard.events.descriptionPlaceholder')}
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
                    placeholder={t('dashboard.events.locationPlaceholder')}
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
                    onClick={onCancel}
                >
                    {t('dashboard.common.cancel')}
                </Button>
                <Button
                    disabled={isPending || !form.title || !form.startDate || !form.endDate || !form.subSchoolId}
                    onClick={handleSubmit}
                    style={{ background: "#1755EC" }}
                    className="text-white flex-1"
                >
                    {isPending
                        ? `${t('dashboard.events.confirm')} : ${t('dashboard.events.save')}`
                        : t('dashboard.events.save')
                    }
                </Button>
            </div>
        </div>
    )
}
