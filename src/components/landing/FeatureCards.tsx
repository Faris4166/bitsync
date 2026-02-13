"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Receipt, BarChart3, History } from "lucide-react";
import { useLanguage } from '@/components/language-provider';

export function FeatureCards() {
    const { t } = useLanguage();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
                icon={<Receipt className="h-7 w-7" />}
                title={t('landing.feature1_title')}
                desc={t('landing.feature1_desc')}
                color="bg-primary"
            />
            <FeatureCard
                icon={<BarChart3 className="h-7 w-7" />}
                title={t('landing.feature2_title')}
                desc={t('landing.feature2_desc')}
                color="bg-primary"
            />
            <FeatureCard
                icon={<History className="h-7 w-7" />}
                title={t('landing.feature3_title')}
                desc={t('landing.feature3_desc')}
                color="bg-primary"
            />
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group p-10 rounded-[2.5rem] glass border border-border/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-primary/10 dark:bg-black/20"
        >
            <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-current/30 group-hover:scale-110 transition-transform duration-500 shadow-${color}/20 dark:shadow-primary/40`}>
                {icon}
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground leading-relaxed font-medium mb-8">
                {desc}
            </p>
        </motion.div>
    );
}
