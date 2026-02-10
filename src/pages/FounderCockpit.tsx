import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Terminal, Zap, Heart, TrendingUp, Users, Shield, ArrowLeft, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const FOUNDER_PASS = 'phoenix2024';

function AnimatedValue({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 120;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

function TerminalLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="font-mono text-xs text-emerald-glow/70"
    >
      <span className="text-gold-glow/60">$ </span>{text}
    </motion.div>
  );
}

interface MetricCardProps {
  icon: typeof Zap;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  delay: number;
}

function MetricCard({ icon: Icon, label, value, prefix, suffix, color, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl md:text-3xl font-display font-bold text-${color}`}>
        <AnimatedValue target={value} prefix={prefix} suffix={suffix} />
      </p>
      {/* Pulse dot */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-${color} animate-pulse`} />
    </motion.div>
  );
}

function LiveFeed({ lang }: { lang: string }) {
  const [events, setEvents] = useState<{ id: number; text: string; time: string }[]>([]);

  useEffect(() => {
    const templates = lang === 'ar'
      ? [
          'صعود جديد مكتمل — الرياض',
          'جلسة تقييم بدأت — جدة',
          'ملاذ السيادة: دخول جديد',
          'تقرير FLUX-DNA تم إنشاؤه',
          'مستخدم جديد — الدمام',
        ]
      : [
          'New ascension completed — Riyadh',
          'Assessment session started — Jeddah',
          'Sovereigness Sanctuary: new entry',
          'FLUX-DNA report generated',
          'New user joined — Dammam',
        ];

    let counter = 0;
    const addEvent = () => {
      const text = templates[Math.floor(Math.random() * templates.length)];
      const now = new Date();
      const time = now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setEvents(prev => [{ id: counter++, text, time }, ...prev].slice(0, 8));
    };

    addEvent();
    const interval = setInterval(addEvent, 3500);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-emerald-glow" />
        <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
          {lang === 'ar' ? 'البث المباشر' : 'Live Feed'}
        </h3>
        <div className="w-2 h-2 rounded-full bg-emerald-glow animate-pulse" />
      </div>
      <div className="space-y-2 max-h-[260px] overflow-hidden">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30 border border-border/20 font-mono text-xs"
            >
              <span className="text-muted-foreground/50 flex-shrink-0">{event.time}</span>
              <span className="text-foreground/80 truncate">{event.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PasswordGate({ onSuccess, lang }: { onSuccess: () => void; lang: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [bootLines, setBootLines] = useState(0);

  useEffect(() => {
    const timers = [0, 300, 600, 900].map((d, i) =>
      setTimeout(() => setBootLines(i + 1), d)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (password === FOUNDER_PASS) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
      setPassword('');
    }
  }, [password, onSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-10 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              {lang === 'ar' ? 'قمرة القيادة' : "Founder's Cockpit"}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {lang === 'ar' ? 'وصول مقيّد' : 'RESTRICTED ACCESS'}
            </p>
          </div>
        </div>

        {/* Boot sequence */}
        <div className="mb-6 space-y-1 p-3 rounded-lg bg-secondary/30 border border-border/20">
          {bootLines >= 1 && <TerminalLine text="flux-dna cockpit v2.0.1" delay={0} />}
          {bootLines >= 2 && <TerminalLine text="initializing secure tunnel..." delay={0} />}
          {bootLines >= 3 && <TerminalLine text="AES-256-GCM handshake ✓" delay={0} />}
          {bootLines >= 4 && <TerminalLine text="awaiting founder authentication_" delay={0} />}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'ar' ? 'رمز الدخول' : 'Access code'}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/40 border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-destructive/60 focus:ring-destructive/30 animate-[shake_0.3s_ease-in-out]'
                  : 'border-border/30 focus:ring-accent/30'
              }`}
              autoFocus
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-destructive font-mono mb-3"
              >
                {lang === 'ar' ? '⛔ رمز غير صحيح' : '⛔ ACCESS DENIED'}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-display font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Authenticate'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function FounderCockpit() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <PasswordGate lang={lang} onSuccess={() => setAuthenticated(true)} />;
  }

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen px-4 py-20 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'العودة' : 'Back'}
        </button>
        <div className="flex items-center gap-2 text-xs text-emerald-glow/80 font-mono">
          <Shield className="w-3.5 h-3.5" />
          {isAr ? 'اتصال آمن' : 'SECURE CONNECTION'}
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-accent" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {isAr ? 'قمرة قيادة المؤسس' : "Founder's Cockpit"}
          </h1>
        </div>
        <p className="text-muted-foreground font-body text-sm">
          {isAr ? 'لوحة التأثير في الوقت الفعلي — FLUX-DNA' : 'Real-time impact dashboard — FLUX-DNA'}
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <MetricCard icon={Zap} label={isAr ? 'الصعودات' : 'Ascensions'} value={1247} color="gold-glow" delay={0.15} />
        <MetricCard icon={Heart} label={isAr ? 'حياة تأثرت' : 'Lives Touched'} value={3891} color="emerald-glow" delay={0.2} />
        <MetricCard icon={TrendingUp} label={isAr ? 'قيمة SAR' : 'SAR Impact'} value={6858500} prefix="SAR " color="indigo-glow" delay={0.25} />
        <MetricCard icon={Users} label={isAr ? 'مستخدمون نشطون' : 'Active Users'} value={482} color="crimson-glow" delay={0.3} />
      </div>

      {/* Two-column: Chart placeholder + Live Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ascension Velocity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 md:p-6"
        >
          <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider mb-4">
            {isAr ? 'سرعة الصعود' : 'Ascension Velocity'}
          </h3>
          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-40">
            {[35, 52, 48, 70, 62, 85, 78, 92, 88, 95, 100, 110].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-accent/60 to-accent/20"
                initial={{ height: 0 }}
                animate={{ height: `${(h / 110) * 100}%` }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground/50">
            <span>{isAr ? 'يناير' : 'Jan'}</span>
            <span>{isAr ? 'ديسمبر' : 'Dec'}</span>
          </div>
        </motion.div>

        {/* Live Feed */}
        <LiveFeed lang={lang} />
      </div>

      {/* Footer Terminal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 rounded-xl bg-secondary/20 border border-border/20 space-y-1"
      >
        <TerminalLine text="system status: ALL SYSTEMS NOMINAL" delay={800} />
        <TerminalLine text={`uptime: ${Math.floor(Math.random() * 30 + 60)} days`} delay={1100} />
        <TerminalLine text="encryption: AES-256-GCM active on all channels" delay={1400} />
        <TerminalLine text="next scheduled backup: 03:00 UTC ■" delay={1700} />
      </motion.div>
    </div>
  );
}
