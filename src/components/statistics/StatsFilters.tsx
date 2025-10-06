import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsFiltersProps {
  timeRange: 'week' | 'month' | 'year' | 'all';
  onTimeRangeChange: (range: 'week' | 'month' | 'year' | 'all') => void;
}

export const StatsFilters = ({ timeRange, onTimeRangeChange }: StatsFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">Time Period:</span>
      <Tabs value={timeRange} onValueChange={(value) => onTimeRangeChange(value as any)}>
        <TabsList>
          <TabsTrigger value="week">7 Days</TabsTrigger>
          <TabsTrigger value="month">30 Days</TabsTrigger>
          <TabsTrigger value="year">1 Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};