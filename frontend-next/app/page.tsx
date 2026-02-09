"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Brain, Shield, Zap, Heart } from "lucide-react";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function PhoenixLanding() {
  return (
    <div className="min-h-screen void-bg flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Floating emerald orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(160 84% 39% / 0.4) 0%, transparent 70%)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(43 96% 56% / 0.3) 0%, transparent 70%)' }}
        animate={{ x: [0, -25, 15, 0], y: [0, 25, -15, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center space-y-10"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Phoenix Icon */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.2), hsl(43 96% 56% / 0.15))',
              border: '1px solid hsl(160 84% 39% / 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 30px hsl(160 84% 39% / 0.2), 0 0 60px hsl(160 84% 39% / 0.1)',
                '0 0 50px hsl(160 84% 39% / 0.4), 0 0 100px hsl(160 84% 39% / 0.15)',
                '0 0 30px hsl(160 84% 39% / 0.2), 0 0 60px hsl(160 84% 39% / 0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-emerald-glow" />
            {/* Orbital ring */}
            <motion.div
              className="absolute inset-[-8px] rounded-full border border-emerald-glow/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold-glow" style={{ background: 'hsl(43 96% 56%)' }} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Main Heading */}
        <motion.div variants={fadeUp} className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight">
            <span className="text-foreground">From Bipolar to </span>
            <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              Expanded Bandwidth
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-glow/80 font-light">
            Your mind isn&apos;t broken. It&apos;s expanded.
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-foreground/60 text-lg leading-relaxed max-w-xl mx-auto"
        >
          FLUX-DNA is a zero-knowledge sanctuary that reframes neurodivergence as cognitive superpower. 
          Built by someone who lived it.
        </motion.p>

        {/* Value Counter */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <div className="glass-card px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Value</p>
            <p className="text-2xl font-bold text-foreground/50 line-through">SAR 5,500</p>
          </div>
          <div className="glass-card px-6 py-4 text-center border-emerald-glow/30" style={{ borderColor: 'hsl(160 84% 39% / 0.3)' }}>
            <p className="text-xs text-emerald-glow uppercase tracking-wider">Your Cost</p>
            <p className="text-2xl font-bold text-emerald-glow">FREE</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <Link href="/assessment">
            <motion.button
              className="group relative px-10 py-5 rounded-2xl font-semibold text-lg text-background overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(160 84% 39% / 0.8))',
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              data-testid="begin-ascension-btn"
            >
              <span className="relative z-10">Begin Your Ascension</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-8 text-muted-foreground/60"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-glow" style={{ color: 'hsl(43 96% 56%)' }} />
            <span className="text-sm">
              <AnimatedCounter target={1247} /> Ascensions
            </span>
          </div>
          <div className="w-px h-4 bg-border/30" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-glow" />
            <span className="text-sm">
              <AnimatedCounter target={3891} /> Lives Touched
            </span>
          </div>
        </motion.div>

        {/* Sanctuary Link */}
        <motion.div variants={fadeUp} className="pt-8">
          <Link href="/sanctuary">
            <motion.button
              className="px-8 py-3 rounded-xl font-medium text-foreground/70 border border-border/30 hover:border-emerald-glow/30 hover:bg-emerald-glow/5 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="enter-sanctuary-btn"
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Enter The Sovereigness Sanctuary
            </motion.button>
          </Link>
        </motion.div>

        {/* Founder note */}
        <motion.p
          variants={fadeUp}
          className="text-xs text-muted-foreground/40 max-w-md mx-auto"
        >
          Built by Yazeed — for every mind that society called &quot;too much.&quot;
        </motion.p>
      </motion.div>
    </div>
  );
}
