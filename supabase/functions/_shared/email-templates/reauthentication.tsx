/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1';
import { Html, Head, Body, Container, Text, Hr } from 'npm:@react-email/components@0.0.22';

interface ReauthEmailProps {
  siteName: string;
  siteUrl: string;
  token: string;
  recipient: string;
}

export default function ReauthenticationEmail({ siteName = 'iGuide Tours', siteUrl = 'https://iguidetours.net', token = '', recipient = '' }: ReauthEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>✦ {siteName}</Text>
          <Text style={heading}>Verification code</Text>
          <Text style={paragraph}>
            Use this one-time code to verify your identity:
          </Text>
          <Text style={code}>{token}</Text>
          <Text style={muted}>
            This code expires in 10 minutes. If you didn't request it, please secure your account.
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
const code = { fontSize: '36px', fontWeight: '700' as const, letterSpacing: '8px', color: 'hsl(200, 98%, 39%)', textAlign: 'center' as const, margin: '24px 0', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' };
const muted = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, marginTop: '24px' };
const hr = { borderColor: '#e5e7eb', margin: '32px 0 16px' };
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const };
