import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Brain, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password, displayName || email.split('@')[0])
      : await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--emerald-glow) / 0.2), hsl(var(--gold-glow) / 0.15))',
              border: '1px solid hsl(var(--emerald-glow) / 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px hsl(160 84% 39% / 0.2)',
                '0 0 40px hsl(160 84% 39% / 0.4)',
                '0 0 20px hsl(160 84% 39% / 0.2)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-8 h-8 text-emerald-glow" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isSignUp ? t('auth.signup_title') : t('auth.login_title')}
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            {isSignUp ? t('auth.signup_subtitle') : t('auth.login_subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs text-muted-foreground font-body mb-1.5">
                  {t('auth.display_name')}
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="bg-secondary/50 border-border/50 font-body"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs text-muted-foreground font-body mb-1.5">
              {t('auth.email')}
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              className="bg-secondary/50 border-border/50 font-body"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground font-body mb-1.5">
              {t('auth.password')}
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-secondary/50 border-border/50 font-body"
            />
          </div>

          {error && (
            <motion.p
              className="text-sm text-destructive font-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-display font-semibold text-background disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--emerald-glow)), hsl(var(--emerald-glow) / 0.8))',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : isSignUp ? t('auth.signup_cta') : t('auth.login_cta')}
          </motion.button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground font-body">
          {isSignUp ? t('auth.have_account') : t('auth.no_account')}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-emerald-glow hover:underline font-medium"
          >
            {isSignUp ? t('auth.login_cta') : t('auth.signup_cta')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
