import React from 'react';
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";
import Image from 'next/image';
import { LandingHero } from '@/components/landing/LandingHero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { LandingContent } from '@/components/landing/LandingContent';

export default async function LandingPage() {
  const user = await currentUser();
  const isSignedIn = !!user;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent_50%)] pointer-events-none" />

      <LandingContent isSignedIn={isSignedIn}>
        <LandingHero isSignedIn={isSignedIn} />

        <section className="py-20 md:py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <LandingFeatureHeader />
            <FeatureCards />
          </div>
        </section>
      </LandingContent>
    </div>
  );
}

// Small client component for the feature header to use translations
import { LandingFeatureHeader } from '@/components/landing/LandingFeatureHeader';