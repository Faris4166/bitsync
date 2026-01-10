'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Download,
    Printer,
    ArrowLeft,
    Edit,
    Smartphone,
    Landmark,
    CheckCircle2,
    Loader2,
    Save
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import generatePayload from 'promptpay-qr'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import Link from 'next/link'

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

export default function ReceiptDetail() {
    const { id } = useParams()
    const router = useRouter()
    const receiptRef = useRef<HTMLDivElement>(null)

    const [receipt, setReceipt] = useState<Receipt | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rRes, pRes, pmRes] = await Promise.all([
                    fetch(`/api/receipts?id=${id}`),
                    fetch('/api/profile'),
                    fetch('/api/payment-methods')
                ])
                if (rRes.ok) setReceipt(await rRes.json())
                if (pRes.ok) setProfile(await pRes.json())
                if (pmRes.ok) setPaymentMethods(await pmRes.json())
            } catch (err) {
                toast.error('ไม่สามารถโหลดข้อมูลใบเสร็จได้')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const exportPDF = async () => {
        if (!receiptRef.current) return
        setIsSaving(true)
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`receipt-${receipt?.receipt_number}.pdf`)
            toast.success('ดาวน์โหลด PDF สำเร็จ')
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการสร้าง PDF')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">กำลังเตรียมเอกสาร...</p>
        </div>
    )

    if (!receipt) return <div>ไม่พบข้อมูลใบเสร็จ</div>

    const selectedPaymentMethods = paymentMethods.filter(pm =>
        receipt.payment_info?.selected_ids?.includes(pm.id)
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" asChild>
                            <Link href="/auth/history">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">Receipt Details</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{receipt.receipt_number}</h1>
                    <p className="text-sm font-medium text-muted-foreground">Issued on {new Date(receipt.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="flex items-center gap-2 no-print">
                    <Button variant="outline" size="sm" className="rounded-md font-semibold" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                    <Button size="sm" className="rounded-md font-semibold shadow-sm" onClick={exportPDF} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* --- RECEIPT A4 AREA --- */}
            <Card className="rounded-xl border border-border shadow-xl bg-card mx-auto overflow-hidden w-fit no-print-shadow">
                <div
                    ref={receiptRef}
                    className="w-[210mm] min-h-[297mm] p-[15mm] text-slate-800 bg-white shadow-inner mx-auto relative printable-content"
                    style={{ fontStyle: 'normal' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-10 mb-10">
                        <div>
                            {profile?.shop_logo_url && (
                                <img src={profile.shop_logo_url} alt="Logo" className="h-12 mb-6 object-contain" />
                            )}
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{profile?.shop_name || 'BITSYNC SHOP'}</h1>
                            <p className="text-[12px] text-slate-500 max-w-xs mt-3 leading-relaxed whitespace-pre-wrap">
                                {profile?.address || 'Address not specified'}
                                <br />
                                Tel: {profile?.phone || '-'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">RECEIPT</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Document</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt Number</p>
                                    <p className="text-lg font-mono font-bold text-slate-900">{receipt.receipt_number}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Issue</p>
                                    <p className="text-md font-bold text-slate-900">{new Date(receipt.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Customer Details</h3>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-slate-900">{receipt.customer_name}</p>
                                <p className="text-sm text-slate-500 font-medium">{receipt.customer_phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-200">
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-[9px] text-slate-500">Description</th>
                                <th className="p-4 text-center font-bold uppercase tracking-widest text-[9px] text-slate-500">Qty</th>
                                <th className="p-4 text-right font-bold uppercase tracking-widest text-[9px] text-slate-500">Unit Price</th>
                                <th className="p-4 text-right font-bold uppercase tracking-widest text-[9px] text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {receipt.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-900">{item.name}</p>
                                    </td>
                                    <td className="p-4 text-center text-slate-600 font-medium">{item.quantity}</td>
                                    <td className="p-4 text-right text-slate-600 font-medium">฿{item.price.toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold text-slate-900">฿{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                            {receipt.labor_cost > 0 && (
                                <tr className="bg-slate-50/50">
                                    <td className="p-4 italic text-slate-500">ค่าแรง / ค่าบริการ</td>
                                    <td className="p-4 text-center">-</td>
                                    <td className="p-4 text-right">-</td>
                                    <td className="p-4 text-right font-bold text-slate-900">฿{receipt.labor_cost.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Summary Section */}
                    <div className="flex justify-between gap-12">
                        {/* Payment Info & QR */}
                        <div className="flex-1">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Payment Methods</h3>
                            <div className="space-y-4">
                                {selectedPaymentMethods.map(pm => (
                                    <div key={pm.id} className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            {pm.type === 'promptpay' ? <Smartphone className="h-5 w-5 text-slate-900" /> : <Landmark className="h-5 w-5 text-slate-900" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {pm.type === 'promptpay' ? 'PrompPay' : pm.bank_name}
                                            </p>
                                            <p className="text-md font-mono font-bold text-slate-700">
                                                {pm.type === 'promptpay' ? pm.promptpay_number : pm.account_number}
                                            </p>
                                            <p className="text-xs text-slate-400">{pm.account_name}</p>

                                            {pm.type === 'promptpay' && pm.promptpay_number && (
                                                <div className="mt-3 p-3 bg-white border border-slate-100 rounded-xl inline-block shadow-sm">
                                                    <QRCodeSVG
                                                        value={generatePayload(pm.promptpay_number, { amount: receipt.total_amount })}
                                                        size={90}
                                                        level="M"
                                                    />
                                                    <p className="text-[8px] text-center mt-1.5 font-bold text-slate-400 uppercase tracking-widest">Scan to Pay</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="w-[35%]">
                            <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">฿{receipt.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Labor / Service</span>
                                    <span className="text-slate-900">฿{receipt.labor_cost.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[11px] font-bold uppercase text-slate-900 tracking-widest">Net Total</span>
                                    <span className="text-2xl font-bold text-slate-900">฿{receipt.total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="mt-16 pt-6 border-t border-slate-200 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signature</p>
                                <div className="mt-10 h-px bg-slate-400 w-full mx-auto" />
                                <p className="mt-2 text-[12px] font-semibold text-slate-900">{profile?.full_name || 'Authorized Personnel'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Watermark/Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none opacity-[0.03]">
                        <CheckCircle2 className="w-[400px] h-[400px]" />
                    </div>
                </div>
            </Card>

            <style jsx global>{`
                @media print {
                    .no-print, nav, aside, button, .action-bar, header { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .no-print-shadow { box-shadow: none !important; border: none !important; }
                    .printable-content { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        padding: 10mm !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    )
}
