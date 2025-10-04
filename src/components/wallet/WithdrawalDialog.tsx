import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserBalance } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WithdrawalDialog = ({ open, onOpenChange }: WithdrawalDialogProps) => {
  const { user } = useAuth();
  const { data: balance } = useUserBalance(user?.id || "");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const withdrawalFee = 0; // Can be configured
  const finalAmount = parseFloat(amount) || 0;
  const totalDeduction = finalAmount + withdrawalFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!balance || balance.amount < totalDeduction) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    if (finalAmount < 50) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is ₹50",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call backend function to create withdrawal with immediate balance deduction
      const { data, error } = await supabase.rpc("create_withdrawal_request", {
        p_user_id: user.id,
        p_amount: finalAmount,
        p_upi_id: upiId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Withdrawal request failed");
      }

      queryClient.invalidateQueries({ queryKey: ["user_balance"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      
      toast({
        title: "Success",
        description: "Withdrawal request submitted. Amount has been deducted from your balance.",
      });
      
      setAmount("");
      setUpiId("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Money</DialogTitle>
          <DialogDescription>
            Request a withdrawal to your UPI account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Available Balance</Label>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <p className="text-2xl font-orbitron font-bold text-gradient">
                ₹{balance?.amount?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="50"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ₹50)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upi">UPI ID</Label>
            <Input
              id="upi"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              required
            />
          </div>

          {withdrawalFee > 0 && (
            <div className="p-3 bg-accent/10 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span>₹{withdrawalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-accent/20 mt-2">
                <span>Total Deduction:</span>
                <span>₹{totalDeduction.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-muted-foreground">
            <p>• Withdrawals are processed within 24 hours</p>
            <p>• Amount will be deducted immediately upon request</p>
            <p>• Boss approval required for processing</p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !balance || balance.amount < totalDeduction}
          >
            {isSubmitting ? "Requesting..." : "Request Withdrawal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
