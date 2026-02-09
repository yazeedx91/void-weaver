import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface FluxResultsReportProps {
  dassScores: { Depression: number; Anxiety: number; Stress: number };
  hexacoScores: {
    HonestyHumility: number;
    Emotionality: number;
    Extraversion: number;
    Agreeableness: number;
    Conscientiousness: number;
    OpennessToExperience: number;
  };
  teiqueScores?: {
    Wellbeing: number;
    SelfControl: number;
    Emotionality: number;
    Sociability: number;
    GlobalEI: number;
  } | null;
  stabilityScore?: number;
  overallStability?: string;
  stabilityAnalysis?: {
    summary?: string;
    recommendations?: string[];
    clinicalNotes?: string;
    personalityMoodInteraction?: string;
    emotionalIntelligenceInsights?: string;
  } | null;
  completedAt: string;
}

function getDassSeverity(scale: string, score: number): string {
  if (scale === 'Depression') {
    if (score <= 9) return 'Normal';
    if (score <= 13) return 'Mild';
    if (score <= 20) return 'Moderate';
    if (score <= 27) return 'Severe';
    return 'Extremely Severe';
  }
  if (scale === 'Anxiety') {
    if (score <= 7) return 'Normal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Severe';
    return 'Extremely Severe';
  }
  if (score <= 14) return 'Normal';
  if (score <= 18) return 'Mild';
  if (score <= 25) return 'Moderate';
  if (score <= 33) return 'Severe';
  return 'Extremely Severe';
}

function getDassSeverityColor(severity: string): string {
  switch (severity) {
    case 'Normal': return '#10B981';
    case 'Mild': return '#6366F1';
    case 'Moderate': return '#F59E0B';
    case 'Severe': return '#EF4444';
    case 'Extremely Severe': return '#DC2626';
    default: return '#94A3B8';
  }
}

function getHexacoLabel(score: number): string {
  if (score <= 2.0) return 'Low';
  if (score <= 3.0) return 'Below Average';
  if (score <= 3.5) return 'Average';
  if (score <= 4.0) return 'Above Average';
  return 'High';
}

function safeFixed(value: unknown, decimals = 2): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toFixed(decimals);
}

function safeNum(value: unknown): number {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num;
}

function getStabilityBadgeColor(stability?: string): string {
  const s = (stability || '').toLowerCase();
  if (s === 'stable') return '#10B981';
  if (s === 'at risk') return '#F59E0B';
  if (s === 'critical') return '#EF4444';
  return '#6366F1';
}

function getAmplitudeLabel(stability?: string): string {
  const s = (stability || '').toLowerCase();
  if (s === 'stable') return 'BALANCED RANGE';
  if (s === 'at risk') return 'HIGH AMPLITUDE';
  if (s === 'critical') return 'PEAK PROCESSING STATE';
  return 'BALANCED RANGE';
}

export const FluxResultsReport = ({
  dassScores,
  hexacoScores,
  teiqueScores,
  stabilityScore,
  overallStability,
  stabilityAnalysis,
  completedAt,
}: FluxResultsReportProps) => {
  const date = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const score = safeNum(stabilityScore);
  const badgeColor = getStabilityBadgeColor(overallStability);
  const amplitudeLabel = getAmplitudeLabel(overallStability);

  const hexacoEntries = [
    { key: 'HH', label: 'Honesty', value: safeNum(hexacoScores.HonestyHumility) },
    { key: 'EM', label: 'Emotionality', value: safeNum(hexacoScores.Emotionality) },
    { key: 'EX', label: 'Extraversion', value: safeNum(hexacoScores.Extraversion) },
    { key: 'AG', label: 'Agreeableness', value: safeNum(hexacoScores.Agreeableness) },
    { key: 'CO', label: 'Conscientiousness', value: safeNum(hexacoScores.Conscientiousness) },
    { key: 'OE', label: 'Openness', value: safeNum(hexacoScores.OpennessToExperience) },
  ];

  const dassEntries = [
    { label: 'Depression', value: safeNum(dassScores.Depression), max: 42, severity: getDassSeverity('Depression', safeNum(dassScores.Depression)) },
    { label: 'Anxiety', value: safeNum(dassScores.Anxiety), max: 42, severity: getDassSeverity('Anxiety', safeNum(dassScores.Anxiety)) },
    { label: 'Stress', value: safeNum(dassScores.Stress), max: 42, severity: getDassSeverity('Stress', safeNum(dassScores.Stress)) },
  ];

  return (
    <Html>
      <Head />
      <Preview>{`Your Dynamic Range Score: ${score}/100 — Full Psychometric Blueprint Inside`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={glassCard}>
            <Section style={logoSection}>
              <Text style={logo}>FLUX-DNA</Text>
              <Text style={logoSubtext}>PSYCHOMETRIC BLUEPRINT</Text>
            </Section>

            <Hr style={dividerGlow} />

            <Section style={heroSection}>
              <Text style={heroDate}>{date}</Text>
              <Heading style={heroHeading}>
                Your Dynamic Range Analysis
              </Heading>
              <Text style={heroSubtext}>
                Comprehensive psychometric intelligence synthesized from 111 clinical-grade data points
              </Text>
            </Section>

            <Section style={scoreCenterSection}>
              <Section style={scoreCircle}>
                <Text style={scoreCircleValue}>{score}</Text>
                <Text style={scoreCircleLabel}>/ 100</Text>
              </Section>
              <Text style={{
                ...amplitudeBadge,
                color: badgeColor,
                borderColor: badgeColor,
              }}>{amplitudeLabel}</Text>
            </Section>

            {stabilityAnalysis?.summary && (
              <Section style={executiveSummarySection}>
                <Text style={executiveSummaryTitle}>EXECUTIVE SUMMARY</Text>
                <Section style={executiveSummaryCard}>
                  <Text style={executiveSummaryText}>{stabilityAnalysis.summary}</Text>
                </Section>
              </Section>
            )}

            <Hr style={dividerGlow} />

            <Section style={sectionBlock}>
              <Text style={sectionTitle}>HEXACO-60 — PERSONALITY RADAR</Text>
              <Text style={sectionSubtitle}>Six-factor personality architecture (1-5 scale)</Text>

              <Section style={radarContainer}>
                {hexacoEntries.map((entry) => {
                  const pct = Math.round((entry.value / 5) * 100);
                  return (
                    <Section key={entry.key} style={radarRow}>
                      <Row>
                        <Column style={radarLabelCol}>
                          <Text style={radarCode}>{entry.key}</Text>
                          <Text style={radarLabel}>{entry.label}</Text>
                        </Column>
                        <Column style={radarBarCol}>
                          <Section style={radarBarBg}>
                            <Section style={{
                              ...radarBarFill,
                              width: `${pct}%`,
                            }} />
                          </Section>
                        </Column>
                        <Column style={radarValueCol}>
                          <Text style={radarValue}>{safeFixed(entry.value)}</Text>
                          <Text style={radarRange}>{getHexacoLabel(entry.value)}</Text>
                        </Column>
                      </Row>
                    </Section>
                  );
                })}
              </Section>
            </Section>

            <Hr style={dividerGlow} />

            <Section style={sectionBlock}>
              <Text style={sectionTitle}>DASS-21 — MENTAL FREQUENCY WAVEFORM</Text>
              <Text style={sectionSubtitle}>Depression, Anxiety & Stress amplitude (DASS-42 aligned)</Text>

              {dassEntries.map((entry) => {
                const pct = Math.min(100, Math.round((entry.value / entry.max) * 100));
                const sevColor = getDassSeverityColor(entry.severity);
                return (
                  <Section key={entry.label} style={waveformRow}>
                    <Row>
                      <Column style={waveformLabelCol}>
                        <Text style={waveformLabel}>{entry.label}</Text>
                      </Column>
                      <Column style={waveformBarCol}>
                        <Section style={waveformBarBg}>
                          <Section style={{
                            height: '6px',
                            borderRadius: '3px',
                            width: `${pct}%`,
                            backgroundColor: sevColor,
                          }} />
                        </Section>
                      </Column>
                      <Column style={waveformValueCol}>
                        <Text style={waveformScore}>{entry.value}</Text>
                        <Text style={{ ...waveformSeverity, color: sevColor }}>{entry.severity}</Text>
                      </Column>
                    </Row>
                  </Section>
                );
              })}
            </Section>

            {teiqueScores && (
              <>
                <Hr style={dividerGlow} />
                <Section style={sectionBlock}>
                  <Text style={sectionTitle}>TEIQue-SF — EMOTIONAL SYNTHESIS</Text>
                  <Text style={sectionSubtitle}>Trait Emotional Intelligence (1-7 scale)</Text>

                  <Section style={teiqueGrid}>
                    {[
                      { label: 'Well-being', value: teiqueScores.Wellbeing },
                      { label: 'Self-Control', value: teiqueScores.SelfControl },
                      { label: 'Emotionality', value: teiqueScores.Emotionality },
                      { label: 'Sociability', value: teiqueScores.Sociability },
                      { label: 'Global EI', value: teiqueScores.GlobalEI },
                    ].map((item) => (
                      <Section key={item.label} style={teiqueItem}>
                        <Text style={teiqueValue}>{safeFixed(item.value)}</Text>
                        <Text style={teiqueMax}>/7</Text>
                        <Text style={teiqueLabel}>{item.label}</Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              </>
            )}

            {stabilityAnalysis?.personalityMoodInteraction && (
              <>
                <Hr style={dividerGlow} />
                <Section style={sectionBlock}>
                  <Text style={sectionTitle}>PERSONALITY-MOOD INTERACTION</Text>
                  <Section style={insightCard}>
                    <Text style={insightText}>{stabilityAnalysis.personalityMoodInteraction}</Text>
                  </Section>
                </Section>
              </>
            )}

            {stabilityAnalysis?.emotionalIntelligenceInsights && (
              <>
                <Hr style={dividerGlow} />
                <Section style={sectionBlock}>
                  <Text style={sectionTitle}>EMOTIONAL INTELLIGENCE INSIGHTS</Text>
                  <Section style={insightCard}>
                    <Text style={insightText}>{stabilityAnalysis.emotionalIntelligenceInsights}</Text>
                  </Section>
                </Section>
              </>
            )}

            {stabilityAnalysis?.recommendations && stabilityAnalysis.recommendations.length > 0 && (
              <>
                <Hr style={dividerGlow} />
                <Section style={sectionBlock}>
                  <Text style={sectionTitle}>STRATEGIC RECOMMENDATIONS</Text>
                  {stabilityAnalysis.recommendations.map((rec, i) => (
                    <Section key={i} style={recRow}>
                      <Row>
                        <Column style={recNumCol}>
                          <Text style={recNum}>{String(i + 1).padStart(2, '0')}</Text>
                        </Column>
                        <Column style={recTextCol}>
                          <Text style={recContent}>{rec}</Text>
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </Section>
              </>
            )}

            {stabilityAnalysis?.clinicalNotes && (
              <>
                <Hr style={dividerGlow} />
                <Section style={sectionBlock}>
                  <Text style={sectionTitle}>CLINICAL NOTES</Text>
                  <Section style={insightCard}>
                    <Text style={insightText}>{stabilityAnalysis.clinicalNotes}</Text>
                  </Section>
                </Section>
              </>
            )}

            <Hr style={dividerGlow} />

            <Section style={encryptionBanner}>
              <Text style={encryptionTitle}>ENCRYPTED AT REST</Text>
              <Text style={encryptionBody}>
                Your assessment data is encrypted with a unique PBKDF2-derived key tied to your account.
                No one — including FLUX operators — can access your raw scores without your authorization.
              </Text>
            </Section>

            <Section style={footerSection}>
              <Text style={footerBrand}>FLUX-DNA</Text>
              <Text style={footerText}>
                Dynamic Range Assessment Platform
              </Text>
              <Text style={footerText}>
                https://flux-dna.com
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FluxResultsReport;

const main: React.CSSProperties = {
  backgroundColor: '#0f172a',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: '40px 0',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '0 16px',
  maxWidth: '600px',
};

const glassCard: React.CSSProperties = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: '24px',
  padding: '48px 36px',
  boxShadow: '0 0 80px rgba(79, 70, 229, 0.12), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(226, 232, 240, 0.06)',
};

const logoSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '4px',
};

const logo: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#E2E8F0',
  margin: '0',
  letterSpacing: '10px',
};

const logoSubtext: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '10px 0 0 0',
  letterSpacing: '4px',
  fontFamily: "'JetBrains Mono', monospace",
};

const dividerGlow: React.CSSProperties = {
  borderColor: 'rgba(99, 102, 241, 0.15)',
  borderTopWidth: '1px',
  margin: '28px 0',
};

const heroSection: React.CSSProperties = {
  textAlign: 'center' as const,
};

const heroDate: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748B',
  margin: '0 0 12px 0',
  letterSpacing: '2px',
  fontFamily: "'JetBrains Mono', monospace",
};

const heroHeading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '300',
  color: '#F1F5F9',
  lineHeight: '1.4',
  margin: '0 0 12px 0',
  letterSpacing: '0.5px',
};

const heroSubtext: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '400',
  color: '#64748B',
  margin: '0',
  lineHeight: '1.6',
};

const scoreCenterSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '28px 0',
};

const scoreCircle: React.CSSProperties = {
  width: '120px',
  height: '120px',
  borderRadius: '60px',
  border: '2px solid rgba(99, 102, 241, 0.4)',
  backgroundColor: 'rgba(99, 102, 241, 0.06)',
  margin: '0 auto 16px auto',
  textAlign: 'center' as const,
  padding: '28px 0 0 0',
  boxShadow: '0 0 40px rgba(99, 102, 241, 0.15), inset 0 0 30px rgba(99, 102, 241, 0.05)',
};

const scoreCircleValue: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: '600',
  color: '#F1F5F9',
  margin: '0',
  letterSpacing: '2px',
  lineHeight: '1',
};

const scoreCircleLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '400',
  color: '#64748B',
  margin: '4px 0 0 0',
};

const amplitudeBadge: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '3px',
  margin: '0',
  padding: '6px 16px',
  border: '1px solid',
  borderRadius: '20px',
  display: 'inline' as const,
  fontFamily: "'JetBrains Mono', monospace",
};

const executiveSummarySection: React.CSSProperties = {
  padding: '8px 0 0 0',
};

const executiveSummaryTitle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '0 0 12px 0',
  letterSpacing: '3px',
  fontFamily: "'JetBrains Mono', monospace",
  textAlign: 'center' as const,
};

const executiveSummaryCard: React.CSSProperties = {
  backgroundColor: 'rgba(99, 102, 241, 0.05)',
  border: '1px solid rgba(99, 102, 241, 0.12)',
  borderRadius: '12px',
  padding: '20px 24px',
};

const executiveSummaryText: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '400',
  color: '#CBD5E1',
  margin: '0',
  lineHeight: '1.8',
};

const sectionBlock: React.CSSProperties = {
  padding: '0',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '0 0 6px 0',
  letterSpacing: '3px',
  fontFamily: "'JetBrains Mono', monospace",
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '400',
  color: '#475569',
  margin: '0 0 20px 0',
};

const radarContainer: React.CSSProperties = {
  padding: '0',
};

const radarRow: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid rgba(226, 232, 240, 0.04)',
};

const radarLabelCol: React.CSSProperties = {
  width: '100px',
  verticalAlign: 'middle' as const,
};

const radarCode: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '0',
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '1px',
};

const radarLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '400',
  color: '#94A3B8',
  margin: '2px 0 0 0',
};

const radarBarCol: React.CSSProperties = {
  verticalAlign: 'middle' as const,
  padding: '0 12px',
};

const radarBarBg: React.CSSProperties = {
  height: '6px',
  borderRadius: '3px',
  backgroundColor: 'rgba(226, 232, 240, 0.06)',
  overflow: 'hidden' as const,
};

const radarBarFill: React.CSSProperties = {
  height: '6px',
  borderRadius: '3px',
  background: 'linear-gradient(90deg, #6366F1, #818CF8)',
};

const radarValueCol: React.CSSProperties = {
  width: '80px',
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
};

const radarValue: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#F1F5F9',
  margin: '0',
  fontFamily: "'JetBrains Mono', monospace",
};

const radarRange: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '400',
  color: '#64748B',
  margin: '2px 0 0 0',
  letterSpacing: '0.5px',
};

const waveformRow: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid rgba(226, 232, 240, 0.04)',
};

const waveformLabelCol: React.CSSProperties = {
  width: '90px',
  verticalAlign: 'middle' as const,
};

const waveformLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '400',
  color: '#94A3B8',
  margin: '0',
};

const waveformBarCol: React.CSSProperties = {
  verticalAlign: 'middle' as const,
  padding: '0 12px',
};

const waveformBarBg: React.CSSProperties = {
  height: '6px',
  borderRadius: '3px',
  backgroundColor: 'rgba(226, 232, 240, 0.06)',
  overflow: 'hidden' as const,
};

const waveformValueCol: React.CSSProperties = {
  width: '100px',
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
};

const waveformScore: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#F1F5F9',
  margin: '0',
  fontFamily: "'JetBrains Mono', monospace",
};

const waveformSeverity: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '500',
  margin: '2px 0 0 0',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const teiqueGrid: React.CSSProperties = {
  textAlign: 'center' as const,
};

const teiqueItem: React.CSSProperties = {
  display: 'inline-block' as const,
  width: '90px',
  padding: '12px 4px',
  textAlign: 'center' as const,
};

const teiqueValue: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#F1F5F9',
  margin: '0',
  fontFamily: "'JetBrains Mono', monospace",
  display: 'inline' as const,
};

const teiqueMax: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '400',
  color: '#475569',
  margin: '0',
  display: 'inline' as const,
};

const teiqueLabel: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '6px 0 0 0',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const insightCard: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  border: '1px solid rgba(226, 232, 240, 0.06)',
  borderRadius: '12px',
  padding: '20px 24px',
};

const insightText: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '400',
  color: '#CBD5E1',
  margin: '0',
  lineHeight: '1.8',
};

const recRow: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid rgba(226, 232, 240, 0.04)',
};

const recNumCol: React.CSSProperties = {
  width: '36px',
  verticalAlign: 'top' as const,
};

const recNum: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '0',
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '1px',
};

const recTextCol: React.CSSProperties = {
  verticalAlign: 'top' as const,
};

const recContent: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '400',
  color: '#CBD5E1',
  margin: '0',
  lineHeight: '1.7',
};

const encryptionBanner: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: 'rgba(99, 102, 241, 0.04)',
  borderRadius: '12px',
  border: '1px solid rgba(99, 102, 241, 0.1)',
};

const encryptionTitle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '500',
  color: '#6366F1',
  margin: '0 0 10px 0',
  letterSpacing: '3px',
  fontFamily: "'JetBrains Mono', monospace",
};

const encryptionBody: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '400',
  color: '#64748B',
  margin: '0',
  lineHeight: '1.7',
};

const footerSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '28px',
};

const footerBrand: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#475569',
  margin: '0 0 4px 0',
  letterSpacing: '4px',
};

const footerText: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '400',
  color: '#334155',
  margin: '0 0 2px 0',
};
