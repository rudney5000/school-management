import {ClassroomPulse, PendingGradingWidget, RecentActivity, ScheduleWidget, StatsCards} from "@/pages/dashboard/ui";
import {GradeDistributionChart} from "@/pages/dashboard/ui/";
import {AssignmentsWidget} from "@/pages/dashboard/ui/";
import {AnnouncementsWidget} from "@/pages/dashboard/ui/";

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
                <AssignmentsWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <AnnouncementsWidget/>

                <PendingGradingWidget/>

                <RecentActivity/>
            </div>
        </div>
    )
}