import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Megaphone } from "lucide-react";

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending announcement
    // In a real app, you would send this to a notification service
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Announcement sent to all players!",
      });
      setTitle("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Send Announcements"
        subtitle="Broadcast messages to all players"
      />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-secondary" />
            Create Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Announcement Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message..."
                rows={8}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length}/500 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Announcements;