'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Printer,
    Smartphone,
    Landmark
} from 'lucide-react'
import useSWR from 'swr'
import { QRCodeCanvas } from 'qrcode.react'
import generatePayload from 'promptpay-qr'
import Link from 'next/link'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { useLanguage } from '@/components/language-provider'


type Receipt = {
    id: string
    receipt_number: string
    customer_name: string
    customer_phone: string
    items: any[]
    labor_cost: number
    subtotal: number
    total_amount: number
    payment_info: any
    created_at: string
}

type Profile = {
    full_name: string
    phone: string
    address: string
    shop_name: string
    shop_logo_url: string
}

type PaymentMethod = {
    id: string
    type: 'promptpay' | 'bank_account'
    promptpay_number?: string
    bank_name?: string
    account_number?: string
    account_name?: string
}

const ITEMS_PER_PAGE = 15

const fetcher = (url: string) => fetch(url).then((res) => res.json())


export default function ReceiptDetail() {
    const { t, language } = useLanguage()
    const { id } = useParams()
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    const { data: receipt, isLoading: receiptLoading } = useSWR<Receipt>(id ? `/api/receipts?id=${id}` : null, fetcher)
    const { data: profile } = useSWR<Profile>('/api/profile', fetcher)
    const { data: paymentMethodsData } = useSWR<PaymentMethod[]>('/api/payment-methods', fetcher)

    const paymentMethods = paymentMethodsData || []
    const isLoading = receiptLoading && !receipt


    const selectedPaymentMethods = React.useMemo(() => paymentMethods.filter(pm =>
        receipt?.payment_info?.selected_ids?.includes(pm.id)
    ), [paymentMethods, receipt?.payment_info?.selected_ids])

    // Chunk items for pagination
    const itemChunks = React.useMemo(() => {
        if (!receipt?.items) return []
        const chunks = []
        for (let i = 0; i < receipt.items.length; i += ITEMS_PER_PAGE) {
            chunks.push(receipt.items.slice(i, i + ITEMS_PER_PAGE))
        }
        return chunks
    }, [receipt?.items])

    const handlePrint = useReactToPrint({
        contentRef: containerRef,
        documentTitle: `receipt-${receipt?.receipt_number || 'draft'}`,
    })

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">{t('common.loading')}</p>
        </div>
    )

    if (!receipt) return <div className="p-8 text-center text-muted-foreground">{t('common.no_data')}</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- PAGE HEADER (Hidden on Print) --- */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-1 no-print">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" asChild>
                            <Link href="/auth/history">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">{t('history.view_detail')}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{receipt.receipt_number}</h1>
                    <p className="text-sm font-medium text-muted-foreground">{language === 'th' ? 'ออกเมื่อ' : 'Issued on'} {new Date(receipt.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="flex items-center gap-2 no-print">
                    <Button variant="outline" size="sm" className="rounded-md font-semibold" onClick={() => handlePrint && handlePrint()}>
                        <Printer className="h-4 w-4 mr-2" /> {t('receipt.print_preview')}
                    </Button>
                </div>
            </div>

            {/* --- RECEIPT CONTAINER PREVIEW BOX --- */}
            {/* Added overflow-auto to handle horizontal scroll on small screens */}
            <div className="w-full overflow-auto bg-slate-100/50 p-4 md:p-8 rounded-xl print:p-0 print:bg-white print:overflow-visible">
                <div ref={containerRef} className="w-fit mx-auto print:mx-0 print:w-full">
                    {itemChunks.map((chunk, pageIndex) => {
                        const isLastPage = pageIndex === itemChunks.length - 1
                        return (
                            <div
                                key={pageIndex}
                                className={`receipt-page bg-white shadow-lg mx-auto relative flex flex-col p-[15mm] mb-8 print:mb-0 print:shadow-none print:break-after-page`}
                                style={{
                                    width: '210mm',
                                    minHeight: '296mm',
                                    fontStyle: 'normal'
                                }}
                            >
                                {/* Header (Repeated on every page) */}
                                <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                                    <div className="flex-1 pr-4">
                                        {profile?.shop_logo_url && (
                                            <img src={profile.shop_logo_url} alt="Logo" className="h-12 mb-3 object-contain" />
                                        )}
                                        <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">{profile?.shop_name || 'BITSYNC SHOP'}</h1>
                                        <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed whitespace-pre-wrap font-medium">
                                            {profile?.address || (language === 'th' ? 'ไม่ระบุที่อยู่' : 'Address not specified')}
                                            <br />
                                            {t('receipt.phone')}: {profile?.phone || '-'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="mb-3 inline-block text-right">
                                            <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{t('receipt.receipt_no').split(' ')[0]}</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">RECEIPT</p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {t('receipt.page')} {pageIndex + 1} / {itemChunks.length}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-end gap-3">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('history.receipt_no')}</p>
                                                <p className="text-sm font-mono font-bold text-slate-900">{receipt.receipt_number}</p>
                                            </div>
                                            <div className="flex items-center justify-end gap-3">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('common.date')}</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(receipt.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Section (Repeated on every page) */}
                                <div className="mb-4">
                                    <div className="p-3 bg-slate-100 rounded-lg border border-slate-100">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('receipt.customer_info')}</h3>
                                        <div className="text-sm font-medium text-slate-900 flex justify-between items-center">
                                            <span className="font-bold">{receipt.customer_name}</span>
                                            <span className="text-slate-500">{receipt.customer_phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="flex-1">
                                    <table className="w-full mb-4">
                                        <thead>
                                            <tr className="border-y border-slate-200 bg-slate-100">
                                                <th className="py-2 text-left font-bold text-[10px] text-slate-500 uppercase tracking-wider pl-4">{t('receipt.items')}</th>
                                                <th className="py-2 text-center font-bold text-[10px] text-slate-500 uppercase tracking-wider w-16">{t('common.quantity')}</th>
                                                <th className="py-2 text-right font-bold text-[10px] text-slate-500 uppercase tracking-wider w-24">{t('common.price')}</th>
                                                <th className="py-2 text-right font-bold text-[10px] text-slate-500 uppercase tracking-wider w-24 pr-4">{t('common.total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {chunk.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="py-2 pl-4">
                                                        <p className="font-medium text-slate-900 text-xs">{item.name}</p>
                                                    </td>
                                                    <td className="py-2 text-center text-slate-600 font-medium text-xs">{item.quantity}</td>
                                                    <td className="py-2 text-right text-slate-600 font-medium text-xs">฿{item.price.toLocaleString()}</td>
                                                    <td className="py-2 pr-4 text-right font-bold text-slate-900 text-xs">฿{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer / Summary (ONLY ON LAST PAGE) */}
                                {isLastPage ? (
                                    <div className="grid grid-cols-12 gap-8 mt-auto pt-6 border-t border-slate-200">
                                        {/* Left: Payment */}
                                        <div className="col-span-12 md:col-span-7 space-y-4">
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('receipt.paid_by')}</h3>
                                                <div className="space-y-3">
                                                    {selectedPaymentMethods.map(pm => (
                                                        <div key={pm.id} className="flex items-start gap-3">
                                                            <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 border border-slate-100">
                                                                {pm.type === 'promptpay' ? <Smartphone className="h-4 w-4 text-slate-900" /> : <Landmark className="h-4 w-4 text-slate-900" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                                    {pm.type === 'promptpay' ? (language === 'th' ? 'พร้อมเพย์' : 'PromptPay') : pm.bank_name}
                                                                </p>
                                                                <p className="text-[10px] font-mono text-slate-600 truncate">
                                                                    {pm.type === 'promptpay' ? pm.promptpay_number : pm.account_number}
                                                                </p>

                                                                {pm.type === 'promptpay' && pm.promptpay_number && (
                                                                    <div className="mt-2 shrink-0">
                                                                        <QRCodeCanvas
                                                                            value={generatePayload(pm.promptpay_number, { amount: receipt.total_amount })}
                                                                            size={60}
                                                                            level="L"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Totals */}
                                        <div className="col-span-12 md:col-span-5">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500 font-medium">{t('receipt.subtotal')}</span>
                                                    <span className="font-bold text-slate-900">฿{receipt.subtotal.toLocaleString()}</span>
                                                </div>
                                                {receipt.labor_cost > 0 && (
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-500 font-medium">{t('receipt.labor_fee')}</span>
                                                        <span className="font-bold text-slate-900">฿{receipt.labor_cost.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="h-px bg-slate-200 my-2" />
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="font-bold text-slate-900">{t('receipt.total_net')}</span>
                                                    <span className="font-bold text-slate-900">฿{receipt.total_amount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="mt-8 text-center">
                                                <div className="border-t border-slate-300 w-3/4 mx-auto mb-2" />
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('receipt.collector')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                            </div>
                        )
                    })}
                </div>

                <style jsx global>{`
                    @media print {
                        @page { margin: 0; size: A4 portrait; }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        body, main { 
                            background: white !important; 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            width: 100% !important; 
                            max-width: none !important;
                        }
                        /* Hide Layout UI */
                        aside, header, nav, .sidebar { display: none !important; }
                        /* Restore Receipt Visibility */
                        .no-print { display: none !important; }
                        .print\\:shadow-none { box-shadow: none !important; border: none !important; }
                        .print\\:break-after-page { break-after: page; }
                        .print\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
                        
                        /* Ensure exact A4 sizing on print - STRICT */
                        .receipt-page {
                             width: 210mm !important;
                             height: 296mm !important;
                             position: relative !important;
                             margin: 0 !important;
                             padding: 15mm !important;
                             overflow: hidden !important;
                             page-break-after: always;
                             left: 0 !important;
                             top: 0 !important;
                        }
                        /* Prevent blank page after the last page */
                        .receipt-page:last-child {
                            page-break-after: auto !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}
