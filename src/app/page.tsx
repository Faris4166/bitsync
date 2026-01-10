"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import {
  Receipt,
  BarChart3,
  History,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MousePointerClick
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      {/* --- Dynamic Mesh Background --- */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 glass">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-360 shadow-lg shadow-primary/20">
              <Sparkles className="text-primary-foreground h-6 w-6 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              Bit<span className="text-primary">Sync</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href={isSignedIn ? "/auth/home" : "/sign-in"}>
              <Button variant="ghost" className="font-bold hover:bg-primary/10 hover:text-primary rounded-xl px-6 transition-all">
                {isSignedIn ? "Go to App" : "Sign In"}
              </Button>
            </Link>
            {!isSignedIn && (
              <SignUpButton mode="modal">
                <Button className="bg-primary text-primary-foreground font-bold rounded-xl px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Get Started
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-48 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-5 py-2 rounded-full glass border border-primary/20 text-primary text-sm font-black tracking-widest flex items-center gap-3 shadow-xl shadow-primary/5"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            V.1.2.2 • PREMIUM RELEASE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-black tracking-[-0.05em] leading-[0.85] text-center mb-10 selection:bg-primary selection:text-primary-foreground"
          >
            Sync Fast. <br />
            <span className="text-primary bg-clip-text">Grow Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mb-14 font-medium leading-relaxed"
          >
            จัดการธุรกิจของคุณด้วยระบบ POS อัจฉริยะ <br className="hidden md:block" />
            ที่มาพร้อมกับความเร็วระดับอัลตร้า ดีไซน์ที่สวยงาม และความแม่นยำสูงสุด
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 mb-24"
          >
            <SignUpButton mode="modal" forceRedirectUrl="/auth/home">
              <Button
                size="lg"
                className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-xl font-black shadow-2xl shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 group border-none"
              >
                เริ่มใช้งานฟรีตอนนี้
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </SignUpButton>
          </motion.div>

          {/* --- Dashboard Mockup --- */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 40, damping: 20 }}
            className="relative w-full max-w-6xl group perspective-1000"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-indigo-500/30 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-60 transition duration-1000" />
            <div className="relative bg-card/60 border border-border/50 rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden backdrop-blur-3xl transition-all duration-700 hover:rotate-x-1">
              {/* Mockup Toolbar */}
              <div className="bg-muted/40 border-b border-border/20 p-5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
                </div>
                <div className="bg-background/50 border border-border/20 px-6 py-1.5 rounded-full text-[12px] text-muted-foreground/60 w-1/2 text-center font-medium tracking-wide">
                  bitsync-pos.io/v1/dashboard
                </div>
                <div className="w-10" />
              </div>

              {/* Mockup Content */}
              <div className="p-10 grid grid-cols-12 gap-8 h-full min-h-[500px]">
                <div className="col-span-3 space-y-6">
                  <div className="h-10 w-3/4 bg-primary/20 rounded-xl" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 w-full bg-muted/30 rounded-2xl border border-border/20" />
                    ))}
                  </div>
                </div>
                <div className="col-span-9 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-card border border-border/20 rounded-3xl shadow-sm glass transition-transform hover:scale-105" />
                    ))}
                  </div>
                  <div className="h-64 w-full bg-card/40 border border-border/10 rounded-3xl shadow-lg glass flex items-end p-8 gap-4 overflow-hidden">
                    {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                        className="flex-1 bg-linear-to-t from-primary/80 to-primary/20 rounded-t-xl transition-all hover:from-primary hover:scale-x-110"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-32">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Designed for Performance.</h2>
            <div className="w-24 h-2 bg-primary rounded-full mb-8" />
            <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
              เราสร้างเครื่องมือที่ตอบโจทย์การทำงานที่รวดเร็วและมีประสิทธิภาพที่สุดสำหรับธุรกิจของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Receipt className="h-7 w-7" />}
              title="Fast Invoicing"
              desc="สร้างและส่งใบเสร็จระดับโปรในพริบตา พร้อมระบบ Tracking ที่แม่นยำ"
              color="bg-primary"
            />
            <FeatureCard
              icon={<BarChart3 className="h-7 w-7" />}
              title="Real-time Analytics"
              desc="สรุปยอดขายและวิเคราะห์ข้อมูลธุรกิจแบบวินาทีต่อวินาที"
              color="bg-emerald-500"
            />
            <FeatureCard
              icon={<History className="h-7 w-7" />}
              title="Safe Cloud History"
              desc="ข้อมูลทั้งหมดถูกเข้ารหัสและสำรองบนระบบ Cloud ระดับมาตรฐานโลก"
              color="bg-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 border-t border-border/40 relative">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="text-primary-foreground h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">
              Bit<span className="text-primary">Sync</span>
            </span>
          </div>
          <p className="text-sm font-bold text-muted-foreground/60 tracking-widest uppercase">
            © 2026 BitSync POS System. Built for winners.
          </p>
          <div className="flex gap-8">
            <span className="text-sm font-bold hover:text-primary cursor-pointer transition-colors">Privacy</span>
            <span className="text-sm font-bold hover:text-primary cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group p-10 rounded-[2.5rem] glass border border-border/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-current/30 group-hover:scale-110 transition-transform duration-500 shadow-${color}/20`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium mb-8">
        {desc}
      </p>
      <div className="flex items-center text-primary font-black text-sm cursor-pointer group-hover:translate-x-2 transition-transform">
        EXPLORE FEATURE <ArrowRight className="ml-2 h-5 w-5" />
      </div>
    </motion.div>
  );
}

function FeatureItem({ icon, iconBg, title, desc }: { icon: React.ReactNode, iconBg: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-start space-y-4 group">
      <div className={`${iconBg} p-3 rounded-2xl shadow-lg transition-transform group-hover:-translate-y-2`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">
        {desc}
      </p>
      <div className="flex items-center text-blue-600 font-bold text-sm cursor-pointer hover:underline">
        เรียนรู้เพิ่มเติม <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </div>
  );
}