import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserBalance, useUserTransactions, useUserDeposits, useUserWithdrawals } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet as WalletIcon, Plus, Minus, History } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { DepositDialog } from "@/components/wallet/DepositDialog";
import { WithdrawalDialog } from "@/components/wallet/WithdrawalDialog";
import { useRealtimeBalance } from "@/hooks/useRealtimeBalance";
import { useRealtimeDepositsWithdrawals } from "@/hooks/useRealtimeDepositsWithdrawals";

const Wallet = () => {
  const { user, userRole } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  
  // Enable real-time subscriptions
  useRealtimeBalance(user?.id);
  useRealtimeDepositsWithdrawals(user?.id, userRole);
  
  const { data: balance, isLoading: balanceLoading } = useUserBalance(user?.id || "");
  const { data: transactions, isLoading: transactionsLoading } = useUserTransactions(user?.id || "");
  const { data: deposits } = useUserDeposits(user?.id || "");
  const { data: withdrawals } = useUserWithdrawals(user?.id || "");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "rejected":
      case "failed":
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "tournament_win":
      case "refund":
        return "text-green-500";
      case "withdrawal":
      case "tournament_entry":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeSymbol = (type: string) => {
    switch (type) {
      case "deposit":
      case "tournament_win":
      case "refund":
        return "+";
      case "withdrawal":
      case "tournament_entry":
        return "";
      default:
        return "";
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Wallet"
        showBack={true}
        subtitle="Manage your balance and transactions"
      />

      {/* Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30 mb-6">
        {balanceLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <WalletIcon className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <h2 className="text-4xl font-orbitron font-bold text-gradient">
                  ₹{balance?.amount?.toFixed(2) || "0.00"}
                </h2>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="premium" className="flex-1" onClick={() => setDepositOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setWithdrawalOpen(true)}>
                <Minus className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Tabs for Transactions, Deposits, Withdrawals */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">
            <History className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="deposits" className="text-xs sm:text-sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Deposits</span>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs sm:text-sm">
            <Minus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Withdrawals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          {transactionsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
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
              <p className="text-muted-foreground">No transactions yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deposits" className="mt-6">
          {deposits && deposits.length > 0 ? (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <Card key={deposit.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">Deposit Request</p>
                      <p className="text-sm text-muted-foreground">
                        UTR: {deposit.utr_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(deposit.created_at), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-500">
                        +₹{deposit.amount.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No deposits yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          {withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">Withdrawal Request</p>
                      <p className="text-sm text-muted-foreground">
                        UPI: {withdrawal.upi_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(withdrawal.created_at), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-500">
                        -₹{withdrawal.amount.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Minus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No withdrawals yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawalDialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
    </MainLayout>
  );
};

export default Wallet;
