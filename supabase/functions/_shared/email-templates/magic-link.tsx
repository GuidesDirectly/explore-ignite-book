/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1';
import { Html, Head, Body, Container, Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22';

interface MagicLinkEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
  recipient: string;
}

export default function MagicLinkEmail({ siteName = 'iGuide Tours', siteUrl = 'https://iguidetours.net', confirmationUrl = '', recipient = '' }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>✦ {siteName}</Text>
          <Text style={heading}>Your sign-in link</Text>
          <Text style={paragraph}>
            Click the button below to sign in to {siteName}. This link expires in 10 minutes.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>
              Sign in
            </Button>
          </Section>
          <Text style={muted}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {siteName} · {siteUrl}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: '480px', margin: '0 auto', padding: '40px 24px' };
const logo = { fontSize: '20px', fontWeight: '700' as const, color: 'hsl(200, 98%, 39%)', textAlign: 'center' as const, marginBottom: '32px' };
const heading = { fontSize: '28px', fontWeight: '700' as const, color: 'hsl(222, 47%, 11%)', textAlign: 'center' as const, margin: '0 0 16px' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: 'hsl(222, 47%, 11%)', textAlign: 'center' as const };
const button = { backgroundColor: 'hsl(200, 98%, 39%)', color: '#f0f9ff', fontSize: '16px', fontWeight: '600' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' };
const muted = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, marginTop: '24px' };
const hr = { borderColor: '#e5e7eb', margin: '32px 0 16px' };
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const };
