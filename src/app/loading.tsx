"use client";

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden">
      {/* --- Navbar Skeleton --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </nav>

      {/* --- Hero Section Skeleton --- */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          
          {/* Badge Skeleton */}
          <Skeleton className="mb-6 h-8 w-48 rounded-full" />

          {/* Title Skeleton */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <Skeleton className="h-16 md:h-24 w-[300px] md:w-[600px] rounded-2xl" />
            <Skeleton className="h-16 md:h-24 w-[250px] md:w-[500px] rounded-2xl" />
          </div>

          {/* Paragraph Skeleton */}
          <div className="space-y-2 mb-12">
            <Skeleton className="h-5 w-[280px] md:w-[450px] mx-auto" />
            <Skeleton className="h-5 w-[200px] md:w-[350px] mx-auto" />
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-16 w-48 rounded-2xl shadow-xl" />

          {/* --- Dashboard Mockup Skeleton --- */}
          <div className="mt-20 w-full max-w-5xl">
            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden aspect-[16/9]">
              {/* Mockup Toolbar */}
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="w-3 h-3 rounded-full" />
                </div>
                <Skeleton className="mx-auto h-5 w-1/3 rounded-lg" />
              </div>
              
              {/* Mockup Content */}
              <div className="p-8 grid grid-cols-12 gap-6 h-full bg-slate-50/30">
                <div className="col-span-3 space-y-4">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <div className="col-span-9 space-y-6">
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}