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
import Image from 'next/image';

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      {/* --- Dynamic Mesh Background --- */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Mobile: Static Gradient (Low Power) */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-emerald-500/5 md:hidden" />

        {/* Desktop: Animated Mesh (High Quality) */}
        <div className="hidden md:block">
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
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[80px] lg:blur-[120px] will-change-transform"
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
            className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[60px] lg:blur-[100px] will-change-transform"
          />
        </div>
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 glass">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:rotate-360 shadow-primary/20">
              {/* <Sparkles className="text-primary-foreground h-6 w-6 fill-current" /> */}
              <Image src="/BitSync.svg" alt="BitSync" width={50} height={50} className="fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              Bit<span className="text-primary">Sync</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
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
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6">
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
            V.1.2.4 • Coming soon
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-9xl font-black tracking-[-0.05em] leading-[0.85] text-center mb-6 md:mb-10 selection:bg-primary selection:text-primary-foreground"
          >

            BitSync !<br />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mb-10 md:mb-14 font-medium leading-relaxed"
          >
            จัดการธุรกิจของคุณด้วยระบบอัจฉริยะ <br className="hidden md:block" />
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
                className="h-16 md:h-20 px-8 md:px-12 rounded-[1.5rem] md:rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-lg md:text-xl font-black shadow-2xl shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 group border-none"
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
            className="relative w-full max-w-[320px] md:max-w-[700px] lg:max-w-6xl mx-auto group perspective-1000"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-indigo-500/30 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-60 transition duration-1000" />


            <div className={`
              relative bg-card overflow-hidden backdrop-blur-xl md:backdrop-blur-3xl transition-all duration-700
              
              /* Mobile (iPhone) */
              rounded-[3rem] border-12 border-gray-950 shadow-2xl
              
              /* Tablet (iPad) */
              md:rounded-[2.5rem] md:border-12
              
              /* Desktop (MacBook Screen) */
              lg:rounded-t-[2rem] lg:rounded-b-none lg:border-16 lg:border-b-0 lg:border-gray-950 lg:shadow-none
            `}>

              {/* iPhone Notch & Camera */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-gray-950 rounded-b-2xl z-20 md:hidden pointer-events-none" />

              {/* MacBook Camera (Desktop Only) */}
              <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-gray-950 rounded-b-xl z-20 pointer-events-none">
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800/80 border border-slate-700/50" />
              </div>

              {/* Browser Toolbar (Desktop Only) */}
              <div className="hidden lg:flex bg-muted/40 border-b border-border/20 p-5 items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-background/50 border border-border/20 px-6 py-1.5 rounded-full text-[12px] text-muted-foreground/60 w-1/2 text-center font-medium tracking-wide">
                  https://bitsync-iota.vercel.app/
                </div>
                <div className="w-10" />
              </div>

              {/* Mockup Content */}
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full min-h-[400px] md:min-h-[500px] bg-background">
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                  <div className="h-10 w-3/4 bg-primary/20 rounded-xl" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 w-full bg-muted/30 rounded-2xl border border-border/20" />
                    ))}
                  </div>
                </div>
                <div className="col-span-1 lg:col-span-9 space-y-8 pt-6 lg:pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 md:h-32 bg-card border border-border/20 rounded-3xl shadow-sm glass transition-transform hover:scale-105" />
                    ))}
                  </div>
                  <div className="h-48 md:h-64 w-full bg-card/40 border border-border/10 rounded-3xl shadow-lg glass flex items-end p-4 md:p-8 gap-2 md:gap-4 overflow-hidden">
                    {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => {
                      const colors = [
                        'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]',
                        'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.5)]',
                        'bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.5)]',
                        'bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.5)]',
                        'bg-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]',
                        'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]',
                        'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]',
                        'bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.5)]',
                        'bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.5)]',
                        'bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.5)]'
                      ];
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                          className={`flex-1 rounded-t-xl transition-all hover:scale-x-110 ${colors[i % colors.length]}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MacBook Base (Desktop Only) */}
            <div className="hidden lg:block relative mx-auto w-[120%] -translate-x-[8%] h-6 bg-gray-300 rounded-b-2xl shadow-2xl border-t border-gray-400">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-gray-400 rounded-b-xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="py-20 md:py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16 md:mb-32">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">Designed for Performance.</h2>
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
              color="bg-primary"
            />
            <FeatureCard
              icon={<History className="h-7 w-7" />}
              title="Safe Cloud History"
              desc="ข้อมูลทั้งหมดถูกเข้ารหัสและสำรองบนระบบ Cloud ระดับมาตรฐานโลก"
              color="bg-primary"
            />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-10 md:py-20 border-t border-border/40 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg flex items-center justify-center">
              <Image src="/BitSync.svg" alt="Logo" width={50} height={50} />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">
              Bit<span className="text-primary">Sync</span>
            </span>
          </div>
          <p className="text-sm font-bold text-muted-foreground/60 tracking-widest uppercase">
            © 2026 BitSync @Faris งานส่งครู
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