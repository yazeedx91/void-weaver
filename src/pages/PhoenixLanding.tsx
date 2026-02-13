import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Shield, ArrowRight, Lock, Linkedin, MessageCircle } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const sectionFade = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

export default function PhoenixLanding() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setStage } = useAssessment();

  const handleBegin = () => {
    setStage('personality');
    navigate('/hakim');
  };

  const instruments = [
    { key: 'hexaco', title: t('assess.hexaco_title'), sub: t('assess.hexaco_sub'), desc: t('assess.hexaco_desc') },
    { key: 'dass', title: t('assess.dass_title'), sub: t('assess.dass_sub'), desc: t('assess.dass_desc') },
    { key: 'teiq', title: t('assess.teiq_title'), sub: t('assess.teiq_sub'), desc: t('assess.teiq_desc') },
  ];

  const reframes = [
    { from: t('phil.from_1'), to: t('phil.to_1') },
    { from: t('phil.from_2'), to: t('phil.to_2') },
    { from: t('phil.from_3'), to: t('phil.to_3') },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="min-h-screen flex items-center justify-center px-4 py-32 relative">
        {/* Ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--indigo-glow) / 0.3) 0%, transparent 70%)' }}
        />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Hero Card */}
          <motion.div
            variants={fadeUp}
            className="glass-card px-8 py-14 sm:px-14 sm:py-20 space-y-8"
          >
            {/* Label */}
            <p className="text-xs sm:text-sm font-body uppercase tracking-[0.35em] text-muted-foreground">
              {t('hero.label')}
            </p>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground">
                {t('hero.tagline_1')}
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-display font-light tracking-tight text-muted-foreground">
                {t('hero.tagline_2')}
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground font-body text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
              {t('hero.description')}
            </p>

            {/* Instrument Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {[t('hero.badge_1'), t('hero.badge_2'), t('hero.badge_3')].map((badge) => (
                <span
                  key={badge}
                  className="px-5 py-2 rounded-full text-xs font-body uppercase tracking-widest text-muted-foreground border border-border/50 bg-secondary/30"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ ASSESSMENT SECTION ═══════════════ */}
      <motion.section
        {...sectionFade}
        className="px-4 py-24 sm:py-32"
      >
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <p className="text-xs font-body uppercase tracking-[0.35em] text-muted-foreground">
              {t('assess.label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {t('assess.title')}
            </h2>
          </div>

          {/* Instrument Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instruments.map((inst, i) => (
              <motion.div
                key={inst.key}
                className="glass-card p-8 space-y-4 text-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <h3 className="text-lg font-display font-bold text-foreground">
                  {inst.title}
                </h3>
                <p className="text-sm font-body uppercase tracking-wider text-emerald-glow/80">
                  {inst.sub}
                </p>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  {inst.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ PHILOSOPHY SECTION ═══════════════ */}
      <motion.section
        {...sectionFade}
        className="px-4 py-24 sm:py-32"
      >
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <p className="text-xs font-body uppercase tracking-[0.35em] text-muted-foreground">
              {t('phil.label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {t('phil.title')}
            </h2>
          </div>

          {/* Reframing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {reframes.map((r, i) => (
              <motion.div
                key={i}
                className="glass-card p-8 text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <p className="text-sm font-body text-muted-foreground/60 line-through">
                  {r.from}
                </p>
                <ArrowRight className="w-4 h-4 mx-auto text-emerald-glow/60 rotate-90" />
                <p className="text-lg font-display font-semibold text-emerald-glow">
                  {r.to}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <motion.section
        {...sectionFade}
        className="px-4 py-24 sm:py-32"
      >
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            {t('cta.title')}
          </h2>
          <p className="text-sm font-body uppercase tracking-[0.25em] text-muted-foreground">
            {t('cta.subtitle')}
          </p>

          <motion.button
            onClick={handleBegin}
            className="group relative px-12 py-5 rounded-xl font-display font-semibold text-sm uppercase tracking-[0.2em] text-background overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.85))',
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">{t('cta.button')}</span>
          </motion.button>

          <p className="text-xs font-body uppercase tracking-widest text-muted-foreground/50 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            {t('cta.note')}
          </p>
        </div>
      </motion.section>

      {/* ═══════════════ FOUNDER SECTION ═══════════════ */}
      <motion.section
        {...sectionFade}
        className="px-4 py-24 sm:py-32"
      >
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <p className="text-xs font-body uppercase tracking-[0.35em] text-muted-foreground">
              {t('founder.label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {t('founder.title')}
            </h2>
          </div>

          {/* Quote */}
          <blockquote className="glass-card p-8 sm:p-12">
            <p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed italic">
              "{t('founder.quote')}"
            </p>
          </blockquote>

          {/* Founder Identity */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-start">
              <p className="text-lg font-display font-bold text-foreground">
                {t('founder.name')}
              </p>
              <p className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                {t('founder.role')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/yazeed-shaheen-583847180/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-body uppercase tracking-wider text-muted-foreground border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">{t('founder.linkedin')}</span>
                <span className="sm:hidden">LinkedIn</span>
              </a>
              <a
                href="https://wa.me/966533632262"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-body uppercase tracking-wider text-muted-foreground border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('founder.whatsapp')}</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Science badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-body uppercase tracking-widest text-emerald-glow/70 border border-emerald-glow/20 bg-emerald-glow/5">
              <Shield className="w-3.5 h-3.5" />
              {t('founder.science')}
            </span>
          </div>
        </div>
      </motion.section>

      {/* Sovereigness Sanctuary Link */}
      <motion.section
        {...sectionFade}
        className="px-4 pb-24 text-center"
      >
        <motion.button
          onClick={() => navigate('/sovereigness')}
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-body text-sm text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shield className="w-4 h-4" />
          {t('sovereigness.enter')}
        </motion.button>
      </motion.section>
    </div>
  );
}
