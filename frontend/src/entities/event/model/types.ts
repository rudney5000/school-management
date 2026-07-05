export type Event = {
    id: string;
    title: string;
    description: string | null;
    type: EventType;
    startDate: string;
    endDate: string;
    location: string;
    isPublic: boolean;
    subSchoolId: string;
    createdBy: string;
    isLiveEvent: boolean
    liveUrl?: string
    createdAt: string;
    updatedAt: string;
};

export enum EventType {
    EXAM = "EXAM",
    MEETING = "MEETING",
    SPORT = "SPORT",
    CULTURAL = "CULTURAL",
    TRIP = "TRIP",
    HOLIDAY = "HOLIDAY",
    COMPETITION = "COMPETITION",
    ACADEMIC = "ACADEMIC",
    SOCIAL = "SOCIAL",
    ART = "ART",
    SCIENCE = "SCIENCE",
    OTHER = "OTHER",
}

export type EventWithRelations = Event

export const EVENT_TYPES: EventType[] = [
    EventType.EXAM,
    EventType.MEETING,
    EventType.SPORT,
    EventType.CULTURAL,
    EventType.TRIP,
    EventType.HOLIDAY,
    EventType.COMPETITION,
    EventType.ACADEMIC,
    EventType.SOCIAL,
    EventType.ART,
    EventType.SCIENCE,
    EventType.OTHER,
]

export const TYPE_CONFIG: Record<
    EventType,
    { colorClasses: string; label: string; badgeClasses: string }
> = {
    [EventType.EXAM]: {
        colorClasses: "bg-red-50 border border-red-300 text-red-800",
        label: "Examen",
        badgeClasses: "bg-red-100 text-red-700 border-0",
    },
    [EventType.MEETING]: {
        colorClasses: "bg-indigo-50 border border-indigo-300 text-indigo-800",
        label: "Réunion",
        badgeClasses: "bg-indigo-100 text-indigo-700 border-0",
    },
    [EventType.SPORT]: {
        colorClasses: "bg-blue-50 border border-blue-300 text-blue-800",
        label: "Sport",
        badgeClasses: "bg-blue-100 text-blue-700 border-0",
    },
    [EventType.CULTURAL]: {
        colorClasses: "bg-teal-50 border border-teal-300 text-teal-800",
        label: "Culturel",
        badgeClasses: "bg-teal-100 text-teal-700 border-0",
    },
    [EventType.TRIP]: {
        colorClasses: "bg-amber-50 border border-amber-300 text-amber-800",
        label: "Voyage",
        badgeClasses: "bg-amber-100 text-amber-700 border-0",
    },
    [EventType.HOLIDAY]: {
        colorClasses: "bg-green-50 border border-green-300 text-green-800",
        label: "Vacances",
        badgeClasses: "bg-green-100 text-green-700 border-0",
    },
    [EventType.COMPETITION]: {
        colorClasses: "bg-rose-50 border border-rose-300 text-rose-800",
        label: "Compétition",
        badgeClasses: "bg-rose-100 text-rose-700 border-0",
    },
    [EventType.ACADEMIC]: {
        colorClasses: "bg-orange-50 border border-orange-300 text-orange-800",
        label: "Académique",
        badgeClasses: "bg-orange-100 text-orange-700 border-0",
    },
    [EventType.SOCIAL]: {
        colorClasses: "bg-pink-50 border border-pink-300 text-pink-800",
        label: "Social",
        badgeClasses: "bg-pink-100 text-pink-700 border-0",
    },
    [EventType.ART]: {
        colorClasses: "bg-purple-50 border border-purple-300 text-purple-800",
        label: "Art",
        badgeClasses: "bg-purple-100 text-purple-700 border-0",
    },
    [EventType.SCIENCE]: {
        colorClasses: "bg-emerald-50 border border-emerald-300 text-emerald-800",
        label: "Science",
        badgeClasses: "bg-emerald-100 text-emerald-700 border-0",
    },
    [EventType.OTHER]: {
        colorClasses: "bg-gray-50 border border-gray-300 text-gray-800",
        label: "Autre",
        badgeClasses: "bg-gray-100 text-gray-700 border-0",
    },
}