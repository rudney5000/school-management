import { Radio, Clock } from 'lucide-react';
import type { LiveSessionStatus } from '@entities/liveSession';

export function LiveSessionBadge({ status }: { status: LiveSessionStatus }) {
    if (status === 'live') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <Radio className="w-3 h-3 animate-pulse" />
                EN DIRECT
            </span>
        );
    }

    if (status === 'scheduled') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Live planifié
            </span>
        );
    }

    return null;
}