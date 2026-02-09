import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface FluxMagicLinkProps {
  magicLink: string;
  securityCode?: string;
}

export const FluxMagicLink = ({
  magicLink,
  securityCode = 'FX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
}: FluxMagicLinkProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your FLUX portal access is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={glassCard}>
            <Section style={logoSection}>
              <Text style={logo}>FLUX-DNA</Text>
              <Text style={logoSubtext}>DYNAMIC RANGE ASSESSMENT PLATFORM</Text>
            </Section>

            <Hr style={divider} />

            <Section style={contentSection}>
              <Heading style={heading}>
                Your portal access is ready.
              </Heading>

              <Text style={paragraph}>
                A secure access request was initiated for your account.
                Click below to enter the assessment portal.
              </Text>

              <Section style={buttonContainer}>
                <Button style={accessButton} href={magicLink}>
                  Access Portal
                </Button>
              </Section>

              <Text style={expiryWarning}>
                This link expires in 24 hours
              </Text>
            </Section>

            <Hr style={divider} />

            <Section style={securitySection}>
              <Text style={securityLabel}>SECURITY SIGNATURE</Text>
              <Text style={securityCodeText}>{securityCode}</Text>
            </Section>

            <Section style={footerSection}>
              <Text style={footerText}>
                If you did not request this access, please ignore this email.
              </Text>
              <Text style={footerLink}>
                <Link href={magicLink} style={linkFallback}>
                  {magicLink}
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FluxMagicLink;

const main = {
  backgroundColor: '#020617',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  padding: '0 20px',
  maxWidth: '520px',
};

const glassCard = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(226, 232, 240, 0.1)',
  borderRadius: '20px',
  padding: '48px 40px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(226, 232, 240, 0.05), 0 0 60px rgba(79, 70, 229, 0.15)',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const logo = {
  fontSize: '36px',
  fontWeight: '600',
  color: '#E2E8F0',
  margin: '0',
  letterSpacing: '12px',
  background: 'linear-gradient(135deg, #E2E8F0 0%, #4F46E5 50%, #E2E8F0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const logoSubtext = {
  fontSize: '9px',
  fontWeight: '500',
  color: '#64748B',
  margin: '8px 0 0 0',
  letterSpacing: '3px',
  fontFamily: "'JetBrains Mono', monospace",
};

const divider = {
  borderColor: 'rgba(226, 232, 240, 0.08)',
  margin: '28px 0',
};

const contentSection = {
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '20px',
  fontWeight: '400',
  color: '#E2E8F0',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
  letterSpacing: '0.5px',
};

const paragraph = {
  fontSize: '14px',
  fontWeight: '300',
  color: '#94A3B8',
  lineHeight: '1.8',
  margin: '0 0 32px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '36px 0',
};

const accessButton = {
  backgroundColor: '#E2E8F0',
  color: '#020617',
  fontSize: '14px',
  fontWeight: '600',
  padding: '16px 48px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 0 30px rgba(226, 232, 240, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)',
  border: 'none',
  letterSpacing: '1px',
};

const expiryWarning = {
  fontSize: '11px',
  fontWeight: '400',
  color: '#4F46E5',
  margin: '28px 0 0 0',
  letterSpacing: '1px',
};

const securitySection = {
  textAlign: 'center' as const,
  marginTop: '8px',
};

const securityLabel = {
  fontSize: '9px',
  fontWeight: '500',
  color: '#475569',
  margin: '0 0 8px 0',
  letterSpacing: '2px',
  fontFamily: "'JetBrains Mono', monospace",
};

const securityCodeText = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#94A3B8',
  margin: '0',
  letterSpacing: '4px',
  fontFamily: "'JetBrains Mono', monospace",
  padding: '10px 20px',
  backgroundColor: 'rgba(79, 70, 229, 0.1)',
  borderRadius: '6px',
  display: 'inline-block',
  border: '1px solid rgba(79, 70, 229, 0.2)',
};

const footerSection = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const footerText = {
  fontSize: '11px',
  fontWeight: '300',
  color: '#475569',
  margin: '0 0 12px 0',
};

const footerLink = {
  fontSize: '10px',
  color: '#334155',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const linkFallback = {
  color: '#4F46E5',
  textDecoration: 'none',
};
