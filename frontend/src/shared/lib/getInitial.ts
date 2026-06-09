export const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return ''

    return name
        .trim()
        .split(/\s+/)
        .filter(part => part.length > 0)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}