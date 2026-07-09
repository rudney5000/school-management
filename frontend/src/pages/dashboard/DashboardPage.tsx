import {
    ClassroomPulse,
    PendingGradingWidget,
    RecentActivity,
    ScheduleWidget,
    StatsCards,
    UpcomingEventsWidget,
    GradeDistributionChart
} from "@/pages/dashboard/ui";

export function DashboardPage() {
    return (
        <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 py-4 md:py-6">

            <StatsCards />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <ClassroomPulse />
                <ScheduleWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <GradeDistributionChart />
                <UpcomingEventsWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <PendingGradingWidget />
                <RecentActivity />
            </div>
        </div>
    )
}