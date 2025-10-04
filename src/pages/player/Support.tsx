import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";

const Support = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Help & Support" 
        subtitle="We're here to help"
        showBack={true}
      />

      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-8 h-8 text-secondary shrink-0" />
            <div>
              <h3 className="font-orbitron font-bold text-lg mb-2">Need Assistance?</h3>
              <p className="text-muted-foreground">
                For any queries, issues, or support, please reach out to us through the following channels:
              </p>
            </div>
          </div>
        </Card>

        <a
          href="https://chat.whatsapp.com/Cq9M7UypAlWEPs0AuQnTpP?mode=ems_email_t"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className="p-6 hover:bg-secondary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">WhatsApp Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join our FFB ARENA WhatsApp group for instant support and updates
                </p>
              </div>
            </div>
          </Card>
        </a>

        <a href="mailto:ffb.arena@gmail.com">
          <Card className="p-6 hover:bg-secondary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Email Support</h3>
                <p className="text-sm text-muted-foreground">ffb.arena@gmail.com</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </Card>
        </a>

        <Card className="p-6 bg-secondary/5">
          <h3 className="font-semibold mb-3">Common Topics</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Tournament registration and participation</li>
            <li>• Deposit and withdrawal issues</li>
            <li>• Account and profile management</li>
            <li>• Prize distribution queries</li>
            <li>• Technical support</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Support;