import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDeposit } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const createDeposit = useCreateDeposit();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !screenshot) {
      toast({
        title: "Error",
        description: "Please fill all fields and upload screenshot",
        variant: "destructive",
      });
      return;
    }

    if (utrNumber.length !== 12) {
      toast({
        title: "Error",
        description: "UTR number must be 12 digits",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload screenshot to Supabase Storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deposit-screenshots')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deposit-screenshots')
        .getPublicUrl(fileName);

      // Create deposit request
      await createDeposit.mutateAsync({
        userId: user.id,
        amount: parseFloat(amount),
        utrNumber,
        screenshotUrl: publicUrl,
      });

      // Reset form
      setAmount("");
      setUtrNumber("");
      setScreenshot(null);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Money</DialogTitle>
          <DialogDescription>
            Complete the UPI payment and submit your deposit request with UTR number
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>UPI Payment Instructions</Label>
            <div className="p-3 bg-secondary/10 rounded-lg text-sm space-y-1">
              <p>UPI ID: <span className="font-semibold">ffbarena@upi</span></p>
              <p className="text-muted-foreground">Send payment and get UTR number</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="utr">UTR Number (12 digits)</Label>
            <Input
              id="utr"
              type="text"
              maxLength={12}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 12-digit UTR"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <div className="flex items-center gap-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              {screenshot && <Upload className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a clear screenshot of your payment
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            variant="premium"
            disabled={uploading || createDeposit.isPending}
          >
            {uploading || createDeposit.isPending ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
