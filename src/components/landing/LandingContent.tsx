'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import Image from 'next/image';
import { useLanguage } from '@/components/language-provider';

export function LandingContent({ children, isSignedIn }: { children: React.ReactNode, isSignedIn: boolean }) {
    const { t } = useLanguage();

    return (
        <>
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
                                priority
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
                                    {t('landing.get_started')}
                                </Button>
                            </SignUpButton>
                        )}
                    </div>
                </div>
            </nav>

            <main>{children}</main>

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
        </>
    );
}
