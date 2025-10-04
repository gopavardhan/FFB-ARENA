import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AllTransactions = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["all-transactions", selectedDate, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
      }

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter as any);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data;
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "tournament_prize":
      case "withdrawal_refund":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "withdrawal":
      case "tournament_entry":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const getTypeSymbol = (type: string) => {
    switch (type) {
      case "deposit":
      case "tournament_prize":
      case "withdrawal_refund":
        return "+";
      case "withdrawal":
      case "tournament_entry":
        return "";
      default:
        return "";
    }
  };

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader
        title="All Transactions"
        showBack={true}
        subtitle="View platform transaction history"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {selectedDate && (
          <Button variant="outline" onClick={() => setSelectedDate(undefined)}>
            Clear Date
          </Button>
        )}

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="tournament_entry">Tournament Entries</SelectItem>
            <SelectItem value="tournament_prize">Tournament Prizes</SelectItem>
            <SelectItem value="withdrawal_refund">Refunds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction: any) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{transaction.profiles.full_name}</p>
                    <Badge className={getTypeColor(transaction.type)}>
                      {transaction.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.profiles.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(transaction.created_at), "PPpp")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTypeSymbol(transaction.type) === '+' ? 'text-green-500' : 'text-red-500'}`}>
                    {getTypeSymbol(transaction.type)}₹{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: ₹{transaction.balance_after.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No transactions found</p>
        </Card>
      )}
    </MainLayout>
  );
};

export default AllTransactions;