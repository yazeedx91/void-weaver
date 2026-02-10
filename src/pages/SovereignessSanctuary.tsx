import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Brain, Coins, Upload, Camera, Mic, X, Check, Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Pillar {
  id: string;
  icon: typeof Shield;
  titleKey: string;
  descKey: string;
  color: string;
  features: string[];
  featuresAr: string[];
}

const pillars: Pillar[] = [
  {
    id: 'legal',
    icon: Shield,
    titleKey: 'pillar.legal',
    descKey: 'pillar.legal.desc',
    color: 'text-indigo-glow',
    features: [
      'Know Your Rights consultation',
      'Protective order guidance',
      'Legal document templates',
      'Court preparation toolkit',
    ],
    featuresAr: [
      'استشارة اعرفي حقوقك',
      'إرشادات أوامر الحماية',
      'نماذج وثائق قانونية',
      'حقيبة التحضير للمحكمة',
    ],
  },
  {
    id: 'medical',
    icon: Heart,
    titleKey: 'pillar.medical',
    descKey: 'pillar.medical.desc',
    color: 'text-crimson-glow',
    features: [
      'Confidential health assessment',
      'Injury documentation guide',
      'Medical facility directory',
      'Telemedicine connections',
    ],
    featuresAr: [
      'تقييم صحي سري',
      'دليل توثيق الإصابات',
      'دليل المرافق الطبية',
      'اتصالات الطب عن بعد',
    ],
  },
  {
    id: 'psychological',
    icon: Brain,
    titleKey: 'pillar.psychological',
    descKey: 'pillar.psychological.desc',
    color: 'text-emerald-glow',
    features: [
      'Trauma-informed support',
      'Safety planning toolkit',
      'Grounding exercises',
      'Crisis intervention resources',
    ],
    featuresAr: [
      'دعم مراعٍ للصدمات',
      'حقيبة تخطيط السلامة',
      'تمارين التأريض',
      'موارد التدخل في الأزمات',
    ],
  },
  {
    id: 'economic',
    icon: Coins,
    titleKey: 'pillar.economic',
    descKey: 'pillar.economic.desc',
    color: 'text-gold-glow',
    features: [
      'Financial independence roadmap',
      'Emergency fund resources',
      'Skills & employment pathways',
      'Micro-grant opportunities',
    ],
    featuresAr: [
      'خارطة الاستقلال المالي',
      'موارد صندوق الطوارئ',
      'مسارات المهارات والتوظيف',
      'فرص المنح الصغيرة',
    ],
  },
];

const pillarDescriptions: Record<string, { en: string; ar: string }> = {
  legal: {
    en: 'Your shield of justice. Access legal resources, understand your rights, and prepare for any legal proceedings with confidence.',
    ar: 'درعك من العدالة. الوصول إلى الموارد القانونية، فهم حقوقك، والتحضير لأي إجراءات قانونية بثقة.',
  },
  medical: {
    en: 'Your health advocate. Confidential medical guidance, injury documentation, and connections to trusted healthcare providers.',
    ar: 'مدافعك الصحي. إرشادات طبية سرية، توثيق الإصابات، واتصالات بمقدمي رعاية صحية موثوقين.',
  },
  psychological: {
    en: 'Your guardian of peace. Trauma-informed support, grounding techniques, and crisis resources when you need them most.',
    ar: 'حارسك للسلام. دعم مراعٍ للصدمات، تقنيات التأريض، وموارد الأزمات عندما تحتاجينها.',
  },
  economic: {
    en: 'Your path to freedom. Financial planning, employment resources, and micro-grants to build your independent future.',
    ar: 'طريقك نحو الحرية. التخطيط المالي، موارد التوظيف، والمنح الصغيرة لبناء مستقبلك المستقل.',
  },
};

function ForensicUpload({ lang }: { lang: string }) {
  const [files, setFiles] = useState<{ name: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = (type: string) => {
    // Simulate file selection
    const fakeName = type === 'photo' ? `evidence_${Date.now()}.jpg` : type === 'audio' ? `recording_${Date.now()}.m4a` : `document_${Date.now()}.pdf`;
    setUploading(true);
    setTimeout(() => {
      setFiles(prev => [...prev, { name: fakeName, type }]);
      setUploading(false);
    }, 1200);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">
          {lang === 'ar' ? 'الشاهد الرقمي' : 'Forensic Witness'}
        </h3>
      </div>
      <p className="text-muted-foreground text-sm mb-6 font-body">
        {lang === 'ar'
          ? 'ارفعي صور أو تسجيلات صوتية بشكل آمن. يتم تجريد جميع البيانات الوصفية تلقائياً لحمايتك.'
          : 'Securely upload photos or audio recordings. All metadata is automatically stripped for your protection.'}
      </p>

      {/* Upload Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { type: 'photo', icon: Camera, label: lang === 'ar' ? 'صورة' : 'Photo' },
          { type: 'audio', icon: Mic, label: lang === 'ar' ? 'تسجيل' : 'Audio' },
          { type: 'document', icon: Upload, label: lang === 'ar' ? 'مستند' : 'Document' },
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleUpload(type)}
            disabled={uploading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Metadata Strip Badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 mb-4">
        <Shield className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="text-xs font-body text-accent">
          {lang === 'ar' ? '🔒 تجريد البيانات الوصفية تلقائي • تشفير AES-256' : '🔒 Auto metadata stripping • AES-256 encrypted'}
        </span>
      </div>

      {/* Uploading Indicator */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 mb-3"
          >
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-body text-muted-foreground">
              {lang === 'ar' ? 'جاري التشفير والرفع...' : 'Encrypting & uploading...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 mb-2"
          >
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-sm font-body text-foreground truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body">
                {lang === 'ar' ? 'مشفّر' : 'Encrypted'}
              </span>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SovereignessSanctuary() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-4 py-20 md:px-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === 'ar' ? 'العودة' : 'Back'}
      </motion.button>

      {/* Hero */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-body mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Shield className="w-4 h-4" />
          {lang === 'ar' ? 'مساحة آمنة • مشفرة' : 'Safe Space • Encrypted'}
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          {t('sovereigness.title')}
        </h1>
        <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
          {t('sovereigness.subtitle')}
        </p>
      </motion.div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          return (
            <motion.button
              key={pillar.id}
              onClick={() => setActivePillar(isActive ? null : pillar.id)}
              className={`glass-card p-5 text-center transition-all duration-300 group ${
                isActive ? 'ring-2 ring-accent/50 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-accent/20' : 'bg-secondary/50 group-hover:bg-accent/10'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : `${pillar.color} group-hover:text-accent`} transition-colors`} />
              </div>
              <h3 className="text-sm md:text-base font-display font-semibold text-foreground">
                {t(pillar.titleKey)}
              </h3>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Pillar Detail */}
      <AnimatePresence mode="wait">
        {activePillar && (
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 md:p-8 mb-10 overflow-hidden"
          >
            {(() => {
              const pillar = pillars.find(p => p.id === activePillar)!;
              const Icon = pillar.icon;
              const desc = pillarDescriptions[activePillar];
              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-semibold text-foreground">
                        {t(pillar.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground font-body">
                        {lang === 'ar' ? desc.ar : desc.en}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(lang === 'ar' ? pillar.featuresAr : pillar.features).map((feature, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * j }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30"
                      >
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm font-body text-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forensic Witness Upload */}
      <ForensicUpload lang={lang} />

      {/* Emergency Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-sm font-body">
          <span className="text-destructive">
            {lang === 'ar' ? '🆘 في حالة الخطر الفوري، اتصلي بالطوارئ: 911' : '🆘 In immediate danger, call emergency: 911'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
