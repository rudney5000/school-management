import { useState } from "react"
import { EventType, EVENT_TYPES, TYPE_CONFIG } from "@entities/event"
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
    isLiveEvent: boolean
    liveUrl?: string
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
    isLiveEvent: false,
}

interface AddEventFormProps {
    subSchoolId?: string
    onSubmit: (data: EventFormState) => Promise<void>
    onCancel: () => void
    isPending?: boolean
}

export function AddEventForm({ subSchoolId, onSubmit, onCancel, isPending }: AddEventFormProps) {
    const [form, setForm] = useState<EventFormState>({
        ...EMPTY_FORM,
        subSchoolId: subSchoolId || "",
    })
    const { t } = useTranslation()

    const handleSubmit = async () => {
        if (!form.title || !form.startDate || !form.endDate || !form.subSchoolId) return
        await onSubmit(form)
    }

    return (
        <div className="grid gap-4 p-4">
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

            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">Événement en ligne (avec live)</p>
                    <p className="text-xs text-muted-foreground">
                        Activer si cet événement sera diffusé en direct
                    </p>
                </div>
                <Switch
                    checked={form.isLiveEvent}
                    onCheckedChange={(v) => setForm({ ...form, isLiveEvent: v })}
                />
            </div>

            {form.isLiveEvent && (
                <div className="grid gap-1.5">
                    <Label htmlFor="ev-live-url">URL du live (optionnel)</Label>
                    <Input
                        id="ev-live-url"
                        placeholder="https://..."
                        value={form.liveUrl || ''}
                        onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    />
                </div>
            )}

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
                        ? `${t('dashboard.events.confirm')} : ${t('dashboard.events.addEvent')}`
                        : t('dashboard.events.addEvent')
                    }
                </Button>
            </div>
        </div>
    )
}
