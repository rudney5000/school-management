import { isAfter } from "date-fns/isAfter"
import { isBefore } from "date-fns/isBefore"
import { isToday } from "date-fns/isToday"
import { startOfDay } from "date-fns/startOfDay"
import { endOfDay } from "date-fns/endOfDay"
import type {Locale} from "date-fns/locale";
import {format} from "date-fns";

export function getWorkdays(year: number, month: number): Date[] {
    const days: Date[] = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay()
        if (dow !== 0 && dow !== 6) days.push(new Date(d))
    }
    return days
}

export function formatDateLabel(date: Date, locale?: Locale): string {
    return format(date, "EEE, MMM d", { locale })
}

export function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function getDayMeta(day: Date, editingDate: string | null) {
    const dateKey = formatDateKey(day)
    return {
        dateKey,
        isPast: isBefore(day, startOfDay(new Date())),
        isFutureDay: isAfter(day, endOfDay(new Date())),
        isToday: isToday(day),
        isEditingThisDate: editingDate === dateKey,
    }
}