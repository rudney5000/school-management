type ElephantWatermarkProps = {
    className?: string
}

export function ElephantWatermark({ className = "" }: ElephantWatermarkProps) {
    return (
        <svg
            viewBox="0 0 400 300"
            className={`pointer-events-none select-none ${className}`}
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M340 120c0-22-18-40-40-40-8 0-15 2-21 6-10-24-34-41-62-41-28 0-52 17-62 41-6-4-13-6-21-6-22 0-40 18-40 40 0 4 1 8 2 12-14 8-24 23-24 41 0 26 21 47 47 47h4v50c0 8 6 14 14 14h20c8 0 14-6 14-14v-30h100v30c0 8 6 14 14 14h20c8 0 14-6 14-14v-53c18-6 31-23 31-43 0-18-10-33-24-41 1-4 2-8 2-12z"
            />
            <circle cx="120" cy="110" r="8" fill="white" opacity="0.4" />
        </svg>
    )
}