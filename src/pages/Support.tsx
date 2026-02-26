import { ArrowLeft, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Support = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Support
      </h1>
      <p className="text-muted-foreground mb-10">We're here to help. Reach out through any of the channels below.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border rounded-xl p-6 space-y-3">
          <Mail className="w-8 h-8 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Email Support</h2>
          <p className="text-sm text-muted-foreground">For booking issues, account help, or general questions.</p>
          <a href="mailto:support@guidesdirectly.com">
            <Button variant="outline" className="w-full mt-2">support@guidesdirectly.com</Button>
          </a>
        </div>

        <div className="border border-border rounded-xl p-6 space-y-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Live Chat</h2>
          <p className="text-sm text-muted-foreground">Chat with our AI assistant for instant help with tours and bookings.</p>
          <Link to="/chat">
            <Button variant="outline" className="w-full mt-2">Open Chat</Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-foreground">How do I book a tour?</p>
            <p className="text-muted-foreground">Browse our guides, select your destination and dates, then submit a booking request. Your guide will confirm within 24 hours.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I cancel or reschedule?</p>
            <p className="text-muted-foreground">Yes — contact your guide directly through the platform or email us. Cancellation policies vary by guide.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Is my payment secure?</p>
            <p className="text-muted-foreground">All transactions are handled through secure, encrypted channels. We never store payment card details.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">How do I become a guide?</p>
            <p className="text-muted-foreground">Visit our <Link to="/guide-register" className="text-primary hover:underline">Guide Registration</Link> page to apply.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Support;
