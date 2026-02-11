"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Image from 'next/image';

export function LandingHero({ isSignedIn }: { isSignedIn: boolean }) {
    return (
        <>
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-emerald-500/5 md:hidden" />
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
                        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/30 rounded-full blur-[80px] lg:blur-[120px] opacity-70 dark:opacity-50"
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
                        className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-[60px] lg:blur-[100px] opacity-70 dark:opacity-40"
                    />
                </div>
            </div>

            <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
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

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 40, damping: 20 }}
                        className="relative w-full max-w-[320px] md:max-w-[700px] lg:max-w-6xl mx-auto group perspective-1000"
                    >
                        <div className="absolute -inset-4 bg-linear-to-r from-primary/40 via-emerald-500/30 to-indigo-500/40 rounded-[3rem] blur-3xl opacity-50 dark:opacity-60 group-hover:opacity-80 transition duration-1000" />
                        <div className={`
              relative bg-card dark:bg-black/80 overflow-hidden backdrop-blur-xl md:backdrop-blur-3xl transition-all duration-700
              rounded-[3rem] border-12 border-gray-950 shadow-2xl dark:shadow-[0_0_50px_-12px_rgba(31,38,135,0.37)]
              md:rounded-[2.5rem] md:border-12
              lg:rounded-t-[2rem] lg:rounded-b-none lg:border-16 lg:border-b-0 lg:border-gray-950 dark:lg:border-gray-900 lg:shadow-none
            `}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-gray-950 rounded-b-2xl z-20 md:hidden pointer-events-none" />
                            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-gray-950 rounded-b-xl z-20 pointer-events-none">
                                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800/80 border border-slate-700/50" />
                            </div>
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
                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full min-h-[400px] md:min-h-[500px] bg-background dark:bg-neutral-950">
                                <div className="hidden lg:block lg:col-span-3 space-y-6">
                                    <div className="h-10 w-3/4 bg-primary/20 dark:bg-primary/30 rounded-xl" />
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-12 w-full bg-muted/30 dark:bg-white/5 rounded-2xl border border-border/20 dark:border-white/10" />
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
                        <div className="hidden lg:block relative mx-auto w-[120%] -translate-x-[8%] h-6 bg-gray-300 dark:bg-gray-800 rounded-b-2xl shadow-2xl border-t border-gray-400 dark:border-gray-700">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-gray-400 dark:bg-gray-700 rounded-b-xl" />
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
