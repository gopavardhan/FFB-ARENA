import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Privacy Policy" 
        subtitle="How we protect your data"
        showBack={true}
      />

      <Card className="p-6 space-y-6">
        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">1. Information We Collect</h3>
          <p className="text-muted-foreground text-sm mb-2">
            We collect the following information:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 ml-4">
            <li>• Name and email address</li>
            <li>• Phone number</li>
            <li>• Payment information (UPI details)</li>
            <li>• Tournament participation records</li>
            <li>• Transaction history</li>
          </ul>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">2. How We Use Your Information</h3>
          <p className="text-muted-foreground text-sm mb-2">
            Your information is used to:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 ml-4">
            <li>• Process tournament registrations</li>
            <li>• Handle deposits and withdrawals</li>
            <li>• Send important updates and notifications</li>
            <li>• Improve our services</li>
            <li>• Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">3. Data Security</h3>
          <p className="text-muted-foreground text-sm">
            We implement industry-standard security measures to protect your personal information. All payment data is encrypted and securely stored.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">4. Data Sharing</h3>
          <p className="text-muted-foreground text-sm">
            We do not sell, trade, or share your personal information with third parties except as required by law or to process payments.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">5. Cookies</h3>
          <p className="text-muted-foreground text-sm">
            We use cookies and similar technologies to enhance your experience, maintain sessions, and analyze platform usage.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">6. Your Rights</h3>
          <p className="text-muted-foreground text-sm mb-2">
            You have the right to:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 ml-4">
            <li>• Access your personal data</li>
            <li>• Request data correction or deletion</li>
            <li>• Opt-out of communications</li>
            <li>• Request account closure</li>
          </ul>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">7. Children's Privacy</h3>
          <p className="text-muted-foreground text-sm">
            FFB ARENA is intended for users 18 years and older. We do not knowingly collect information from minors.
          </p>
        </section>

        <section>
          <h3 className="font-orbitron font-bold text-lg mb-3">8. Changes to Privacy Policy</h3>
          <p className="text-muted-foreground text-sm">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For privacy concerns, contact us at ffb.arena@gmail.com
          </p>
        </div>
      </Card>
    </MainLayout>
  );
};

export default PrivacyPolicy;