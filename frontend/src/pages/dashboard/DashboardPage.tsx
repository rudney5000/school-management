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
        <div className="space-y-6">

            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClassroomPulse />
                <ScheduleWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <GradeDistributionChart />
                <UpcomingEventsWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                <PendingGradingWidget/>

                <RecentActivity/>
            </div>
        </div>
    )
}