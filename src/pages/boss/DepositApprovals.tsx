import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Copy, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string;
  screenshot_url: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const DepositApprovals = () => {
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchUtr, setSearchUtr] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: deposits, isLoading } = useQuery({
    queryKey: ["pending-deposits"],
    queryFn: async () => {
      const { data: depositsData, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!depositsData || depositsData.length === 0) return [];

      const userIds = depositsData.map(d => d.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      return depositsData.map(deposit => ({
        ...deposit,
        profiles: profilesData?.find(p => p.id === deposit.user_id) || { full_name: "Unknown", email: "Unknown" },
      })) as Deposit[];
    },
  });

  const approveDepositMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const deposit = deposits?.find(d => d.id === depositId);
      if (!deposit) throw new Error("Deposit not found");

      const { data, error } = await supabase.rpc("approve_deposit", {
        p_deposit_id: depositId,
        p_boss_id: user?.id,
        p_boss_notes: null,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; screenshot_url?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Approval failed");
      }

      if (result.screenshot_url) {
        const screenshotPath = result.screenshot_url.split('/').pop();
        if (screenshotPath) {
          await supabase.storage
            .from("deposit-screenshots")
            .remove([`${deposit.user_id}/${screenshotPath}`]);
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Deposit Approved",
        description: "Deposit has been approved and balance updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve deposit",
        variant: "destructive",
      });
    },
  });

  const rejectDepositMutation = useMutation({
    mutationFn: async ({ depositId, reason }: { depositId: string; reason: string }) => {
      const deposit = deposits?.find(d => d.id === depositId);
      if (!deposit) throw new Error("Deposit not found");

      const { data, error } = await supabase.rpc("reject_deposit", {
        p_deposit_id: depositId,
        p_boss_id: user?.id,
        p_boss_notes: reason,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; screenshot_url?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Rejection failed");
      }

      if (result.screenshot_url) {
        const screenshotPath = result.screenshot_url.split('/').pop();
        if (screenshotPath) {
          await supabase.storage
            .from("deposit-screenshots")
            .remove([`${deposit.user_id}/${screenshotPath}`]);
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Deposit Rejected",
        description: "Deposit has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject deposit",
        variant: "destructive",
      });
    },
  });

  const handleViewScreenshot = async (deposit: Deposit) => {
    const { data } = await supabase.storage
      .from("deposit-screenshots")
      .createSignedUrl(deposit.screenshot_url.split('/deposit-screenshots/')[1], 60);
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    toast({
      title: "Copied",
      description: "UTR copied to clipboard",
    });
  };

  const handleReject = () => {
    if (selectedDeposit && rejectionReason.trim()) {
      rejectDepositMutation.mutate({
        depositId: selectedDeposit.id,
        reason: rejectionReason,
      });
    }
  };

  const filteredDeposits = deposits?.filter(deposit => 
    !searchUtr || deposit.utr_number.includes(searchUtr)
  );

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader
        title="Deposit Approvals"
        showBack={true}
        subtitle="Review and approve pending deposits"
      />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by UTR number..."
            value={searchUtr}
            onChange={(e) => setSearchUtr(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDeposits && filteredDeposits.length > 0 ? (
            filteredDeposits.map((deposit) => (
              <Card key={deposit.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">
                    {deposit.profiles.full_name}
                  </CardTitle>
                  <Badge variant="secondary">Pending</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg">₹{deposit.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">UTR Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono">{deposit.utr_number}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyUtr(deposit.utr_number)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Player Email</p>
                        <p>{deposit.profiles.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{new Date(deposit.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewScreenshot(deposit)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Screenshot
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveDepositMutation.mutate(deposit.id)}
                        disabled={approveDepositMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
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
                <p className="text-muted-foreground">
                  {searchUtr ? "No deposits found matching search" : "No pending deposits"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectDepositMutation.isPending}
              >
                Reject Deposit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default DepositApprovals;