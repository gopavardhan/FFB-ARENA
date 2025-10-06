import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsOverview } from "@/components/statistics/StatsOverview";
import { PerformanceChart } from "@/components/statistics/PerformanceChart";
import { RecentMatches } from "@/components/statistics/RecentMatches";
import { LeaderboardCard } from "@/components/statistics/LeaderboardCard";
import { StatsFilters } from "@/components/statistics/StatsFilters";

const Statistics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

  return (
    <MainLayout>
      <PageHeader 
        title="Statistics" 
        subtitle="Track your performance and progress"
      />

      <div className="space-y-6">
        <StatsFilters timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <LeaderboardCard />
          </div>
        </div>

        <RecentMatches />
      </div>
    </MainLayout>
  );
};

export default Statistics;