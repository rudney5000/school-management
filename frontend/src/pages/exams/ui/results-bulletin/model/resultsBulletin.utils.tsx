import { Medal, TrendingUp, TrendingDown } from "lucide-react"

export function getRankIcon(rank?: number) {
    if (!rank) return null
    if (rank === 1) return <Medal className="w-4 h-4 text-yellow-500" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />
    return null
}

export function getAverageColor(average: number) {
    if (average >= 16) return "text-green-600 bg-green-50"
    if (average >= 14) return "text-blue-600 bg-blue-50"
    if (average >= 12) return "text-cyan-600 bg-cyan-50"
    if (average >= 10) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
}

export function getTrendIcon(average: number, classAverage: number) {
    if (average > classAverage) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (average < classAverage) return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
}