import {StatCard} from "@/pages/dashboard/ui/";

export function StatsCards() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
                value="82.4%"
                label="Class Average Score"
                sub="Across all 3 classes · CS101/102/201"
                trend="up"
                trendLabel="+3.2% vs Q1"
            />

            <StatCard
                value="94.1%"
                label="Attendance Rate"
                sub="3 absent today"
                trend="stable"
                trendLabel="→ Stable"
            />

            <StatCard
                value="5"
                label="Assignments Due Today"
                sub="71 / 87 students submitted"
                trend="down"
                trendLabel="12 ungraded"
            />

            <StatCard
                value="7"
                label="At-Risk Students"
                sub="Below 60% threshold"
                trend="warning"
                trendLabel="Needs attention"
                alert
            />

            <StatCard
                value="78%"
                label="Live Engagement"
                sub="CS101 · Period 3 · Now"
                trend="up"
                trendLabel="+8% today"
                highlight
            />
        </div>
    )
}