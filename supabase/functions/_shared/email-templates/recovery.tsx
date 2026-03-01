/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1';
import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from 'npm:@react-email/components@0.0.22';

interface RecoveryEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
  recipient: string;
}

export default function RecoveryEmail({ siteName = 'iGuide Tours', siteUrl = 'https://iguidetours.net', confirmationUrl = '', recipient = '' }: RecoveryEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBar}>
            <Img src="https://iguidetours.net/logo.jpg" alt="iGuide Tours" width="80" height="80" style={logoImg} />
            <Text style={headerLogo}>
              <span style={{ color: '#ffffff' }}>Guides</span>
              <span style={{ color: '#2ECC71' }}>Directly</span>
            </Text>
            <Text style={headerSub}>by iGuide Tours</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Reset your password</Text>
            <Text style={paragraph}>
              We received a request to reset your password. Click below to choose a new one — it only takes a moment.
            </Text>
            <Section style={ctaSection}>
              <Button style={button} href={confirmationUrl}>
                Reset password
              </Button>
            </Section>
            <Text style={muted}>
              If you didn't request this, no action is needed — your password stays the same.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>© {siteName} · <a href={siteUrl} style={footerLink}>{siteUrl}</a></Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: '520px', margin: '0 auto', padding: '0' };
const headerBar = { backgroundColor: '#0E2A47', padding: '28px 32px 20px', borderRadius: '8px 8px 0 0', textAlign: 'center' as const };
const logoImg = { margin: '0 auto 12px', borderRadius: '12px', display: 'block' };
const headerLogo = { fontSize: '26px', fontWeight: '700' as const, fontFamily: "'Playfair Display', Georgia, serif", margin: '0', lineHeight: '1.2' };
const headerSub = { fontSize: '11px', color: '#8AACCA', margin: '4px 0 0', letterSpacing: '0.5px' };
const content = { padding: '36px 32px 28px' };
const heading = { fontSize: '26px', fontWeight: '700' as const, color: '#0E2A47', textAlign: 'center' as const, margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#1B2A3D', textAlign: 'center' as const };
const ctaSection = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#0891b2', color: '#f0f9ff', fontSize: '16px', fontWeight: '600' as const, padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' };
const muted = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, marginTop: '24px' };
const hr = { borderColor: '#e5e7eb', margin: '0 32px' };
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, padding: '16px 32px' };
const footerLink = { color: '#0891b2', textDecoration: 'none' };
