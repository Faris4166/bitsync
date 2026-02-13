'use client';

import React from 'react';
import { useLanguage } from '@/components/language-provider';

export function LandingFeatureHeader() {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center text-center mb-16 md:mb-32">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                {t('landing.designed_for_perf')}
            </h2>
            <div className="w-24 h-2 bg-primary rounded-full mb-8" />
            <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
                {t('landing.perf_desc')}
            </p>
        </div>
    );
}
