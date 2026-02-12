import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setAvatarUrl(data.avatar_url || '');
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), avatar_url: avatarUrl.trim() })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: t('profile.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('profile.saved') });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        className="glass-card w-full max-w-md p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground font-heading">{t('profile.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
        </div>

        <div className="flex justify-center">
          <Avatar className="w-24 h-24 border-2 border-accent/40">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-secondary text-foreground text-2xl">
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground/80">{t('profile.display_name')}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('auth.name_placeholder')}
              className="bg-secondary/50 border-border/50 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-foreground/80">{t('profile.avatar_url')}</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-secondary/50 border-border/50 text-foreground"
            />
          </div>

          <div className="text-xs text-muted-foreground">{user?.email}</div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {t('profile.save')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
