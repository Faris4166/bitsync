import React from 'react';
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";
import Image from 'next/image';
import { LandingHero } from '@/components/landing/LandingHero';
import { FeatureCards } from '@/components/landing/FeatureCards';

export default async function LandingPage() {
  const user = await currentUser();
  const isSignedIn = !!user;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent_50%)] pointer-events-none" />
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 glass">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:rotate-360 dark:drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
              <Image
                src="/BitSync.svg"
                alt="BitSync"
                width={50}
                height={50}
                className="fill-current"
                priority // Priority for LCP
              />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              Bit<span className="text-primary dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">Sync</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!isSignedIn && (
              <SignUpButton mode="modal">
                <Button className="bg-primary text-primary-foreground font-bold rounded-xl px-6 shadow-lg shadow-primary/20 dark:shadow-primary/40 hover:scale-105 transition-all">
                  Get Started
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </nav>

      <LandingHero isSignedIn={isSignedIn} />

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

          <FeatureCards />
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
        </div>
      </footer>
    </div>
  );
}