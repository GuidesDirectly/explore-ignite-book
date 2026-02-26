import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Privacy Policy
      </h1>
      <p className="text-muted-foreground mb-8">Last updated: February 26, 2026</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>Guides Directly ("we", "our", "us") collects the following information when you use our platform:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account information:</strong> Name, email address, and phone number when you create an account or submit a booking.</li>
            <li><strong>Booking details:</strong> Tour preferences, dates, group size, and special requests.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and device/browser information for analytics.</li>
            <li><strong>Communications:</strong> Messages exchanged with tour guides through our platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To facilitate bookings between travelers and tour guides.</li>
            <li>To communicate with you about your bookings and account.</li>
            <li>To improve our platform and user experience.</li>
            <li>To send relevant updates about your tours and destinations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Information Sharing</h2>
          <p>We share your information only with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Tour guides you choose to book with (name, contact info, tour preferences).</li>
            <li>Service providers that help us operate the platform (hosting, analytics).</li>
            <li>Law enforcement when required by law.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p>We use industry-standard encryption (TLS/SSL), row-level security policies, and secure authentication to protect your data. Access to personal information is restricted to authorized personnel only.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>You may request to access, update, or delete your personal information at any time by contacting us at <a href="mailto:support@guidesdirectly.com" className="text-primary hover:underline">support@guidesdirectly.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Cookies & Analytics</h2>
          <p>We use essential cookies to maintain your session and optional analytics to understand usage patterns. No third-party advertising cookies are used.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Children's Privacy</h2>
          <p>Our platform is not intended for children under 13. We do not knowingly collect data from children.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
          <p>We may update this policy periodically. Changes will be posted on this page with a revised date.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <p>For privacy-related questions, contact us at <a href="mailto:support@guidesdirectly.com" className="text-primary hover:underline">support@guidesdirectly.com</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
