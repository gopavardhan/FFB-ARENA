import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRecentPerformance } from "@/hooks/usePlayerStats";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

export const PerformanceChart = () => {
  const { user } = useAuth();
  const { data: performance, isLoading } = useRecentPerformance(user?.id);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!performance || performance.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
        <div className="text-center py-8 text-muted-foreground">
          No performance data available yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={performance}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tournaments" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={2}
            name="Tournaments"
          />
          <Line 
            type="monotone" 
            dataKey="wins" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            name="Wins"
          />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Earnings (₹)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
