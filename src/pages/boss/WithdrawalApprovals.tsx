import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const WithdrawalApprovals = () => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [payoutUtr, setPayoutUtr] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["pending-withdrawals"],
    queryFn: async () => {
      const { data: withdrawalsData, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!withdrawalsData || withdrawalsData.length === 0) return [];

      // Fetch profiles for all withdrawals
      const userIds = withdrawalsData.map(w => w.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Merge withdrawals with profiles
      return withdrawalsData.map(withdrawal => ({
        ...withdrawal,
        profiles: profilesData?.find(p => p.id === withdrawal.user_id) || { full_name: "Unknown", email: "Unknown" },
      })) as Withdrawal[];
    },
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, utr }: { withdrawalId: string; utr: string }) => {
      // Call backend function to approve withdrawal
      const { data, error } = await supabase.rpc("approve_withdrawal", {
        p_withdrawal_id: withdrawalId,
        p_boss_id: user?.id,
        p_payout_utr: utr,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Approval failed");
      }
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Approved",
        description: "Withdrawal has been approved and processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
      setIsApproveDialogOpen(false);
      setPayoutUtr("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    },
  });

  const cancelWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, reason }: { withdrawalId: string; reason: string }) => {
      // Call backend function to cancel withdrawal with refund
      const { data, error } = await supabase.rpc("cancel_withdrawal", {
        p_withdrawal_id: withdrawalId,
        p_boss_id: user?.id,
        p_cancellation_reason: reason,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Cancellation failed");
      }
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Cancelled",
        description: "Withdrawal has been cancelled and amount refunded.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
      setIsCancelDialogOpen(false);
      setCancellationReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (selectedWithdrawal && payoutUtr.trim().length === 12) {
      approveWithdrawalMutation.mutate({
        withdrawalId: selectedWithdrawal.id,
        utr: payoutUtr,
      });
    }
  };

  const handleCancel = () => {
    if (selectedWithdrawal && cancellationReason.trim()) {
      cancelWithdrawalMutation.mutate({
        withdrawalId: selectedWithdrawal.id,
        reason: cancellationReason,
      });
    }
  };

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader
        title="Withdrawal Approvals"
        subtitle="Process pending withdrawal requests"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {withdrawals && withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">
                    {withdrawal.profiles.full_name}
                  </CardTitle>
                  <Badge variant="secondary">Pending</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg">₹{withdrawal.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">UPI ID</p>
                        <p className="font-mono break-all">{withdrawal.upi_id}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Player Email</p>
                        <p>{withdrawal.profiles.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Requested</p>
                        <p>{new Date(withdrawal.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setIsApproveDialogOpen(true);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setIsCancelDialogOpen(true);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending withdrawals</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="utr">Payout UTR Number (12 digits)</Label>
              <Input
                id="utr"
                value={payoutUtr}
                onChange={(e) => setPayoutUtr(e.target.value)}
                placeholder="Enter 12-digit UTR"
                maxLength={12}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={payoutUtr.length !== 12 || approveWithdrawalMutation.isPending}
              >
                Approve Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={!cancellationReason.trim() || cancelWithdrawalMutation.isPending}
              >
                Cancel Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default WithdrawalApprovals;
