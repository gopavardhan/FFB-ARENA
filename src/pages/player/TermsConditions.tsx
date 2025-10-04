import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";

const TermsConditions = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Terms & Conditions" 
        subtitle="FFB ARENA usage terms"
        showBack={true}
      />

      <Card className="p-6 space-y-6">
        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">1. Acceptance of Terms</h3>
          <p className="text-muted-foreground text-sm">
            By accessing and using FFB ARENA, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">2. Tournament Participation</h3>
          <p className="text-muted-foreground text-sm mb-2">
            All players must:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 ml-4">
            <li>• Register with valid and accurate information</li>
            <li>• Have sufficient balance before joining tournaments</li>
            <li>• Follow tournament rules and timings</li>
            <li>• Maintain fair play and sportsmanship</li>
          </ul>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">3. Payment Terms</h3>
          <p className="text-muted-foreground text-sm mb-2">
            Deposits and withdrawals:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 ml-4">
            <li>• All transactions require approval</li>
            <li>• Minimum withdrawal amount is ₹50</li>
            <li>• UTR numbers must be unique and valid</li>
            <li>• Withdrawals are processed within 24 hours</li>
          </ul>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">4. Fair Play Policy</h3>
          <p className="text-muted-foreground text-sm">
            Any form of cheating, hacking, or unfair advantage will result in immediate disqualification and account suspension.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">5. Liability</h3>
          <p className="text-muted-foreground text-sm">
            FFB ARENA is not responsible for any technical issues, game disruptions, or external factors affecting tournament outcomes.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">6. Account Termination</h3>
          <p className="text-muted-foreground text-sm">
            We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activities.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">7. Changes to Terms</h3>
          <p className="text-muted-foreground text-sm">
            FFB ARENA reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
          </p>
        </section>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For questions about these terms, contact us at ffb.arena@gmail.com
          </p>
        </div>
      </Card>
    </MainLayout>
  );
};

export default TermsConditions;