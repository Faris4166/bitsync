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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <Sparkles className="text-white h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter uppercase italic">
              Bit<span className="text-blue-600">Sync</span>
            </span>
          </div>

        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[13px] font-bold tracking-wide flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            NEW: V.1.0.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-[900] tracking-[ -0.04em] leading-[0.95] text-center mb-8"
          >
            Manage Business <br />
            <span className="text-blue-600">Faster than ever.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 text-center max-w-2xl mb-12 font-medium"
          >
            จัดการการขาย ออกใบเสร็จ และดูสรุปรายได้แบบเรียลไทม์ <br className="hidden md:block" />
            ผ่านระบบหลังร้านที่ออกแบบมาเพื่อความเร็วสูงสุด
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <SignUpButton mode="modal" forceRedirectUrl="/auth/home">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl shadow-blue-200 group border-none"
                >
                  <span className="relative z-10 flex items-center">
                    สมัครสมาชิกฟรี
                    <ArrowRight className="ml-2 h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </SignUpButton>
          </motion.div>

          {/* --- Dashboard Preview Mockup --- */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
            className="mt-20 relative w-full max-w-5xl group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden aspect-[16/9]">
              {/* Mockup Toolbar */}
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto bg-white border border-slate-200 px-4 py-1 rounded-lg text-[11px] text-slate-400 w-1/3 text-center">
                  bitsync-pos.com/dashboard
                </div>
              </div>
              {/* Mockup Content */}
              <div className="p-8 grid grid-cols-12 gap-6 h-full bg-slate-50/30">
                <div className="col-span-3 space-y-4">
                  <div className="h-8 w-full bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-20 w-full bg-white border border-slate-100 rounded-xl shadow-sm" />
                  <div className="h-20 w-full bg-white border border-slate-100 rounded-xl shadow-sm" />
                </div>
                <div className="col-span-9 space-y-6">
                  <div className="h-40 w-full bg-white border border-slate-100 rounded-2xl shadow-sm flex items-end p-6 gap-2">
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t-md transition-all hover:bg-blue-500" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm" />
                    <div className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Feature Sections --- */}
      <section className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">ฟีเจอร์ที่ช่วยให้ร้านโตไว</h2>
            <p className="text-slate-500">ลดเวลาทำงานเอกสาร แล้วไปโฟกัสที่การขาย</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureItem
              icon={<Receipt className="h-6 w-6 text-white" />}
              iconBg="bg-blue-600"
              title="Fast Invoicing"
              desc="ออกใบเสร็จในคลิกเดียว รองรับการส่งผ่าน Line และ Email ทันที"
            />
            <FeatureItem
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              iconBg="bg-emerald-500"
              title="Income Tracking"
              desc="วิเคราะห์กำไร ขาดทุน รายวันและรายเดือน พร้อมสรุปยอดฝากธนาคาร"
            />
            <FeatureItem
              icon={<History className="h-6 w-6 text-white" />}
              iconBg="bg-indigo-600"
              title="History Logs"
              desc="เก็บบันทึกทุก Transaction ปลอดภัยบนระบบ Cloud ย้อนดูได้ตลอดเวลา"
            />
          </div>
        </div>
      </section>

      {/* --- Simple Footer --- */}
      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100">
        © 2026 BitSync POS System. All rights reserved.
      </footer>
    </div>
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