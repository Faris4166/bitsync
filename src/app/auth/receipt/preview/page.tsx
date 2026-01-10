'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
    Save,
    Check
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import generatePayload from 'promptpay-qr'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import Link from 'next/link'

type ReceiptDraft = {
    customer_name: string
    customer_phone: string
    items: any[]
    labor_cost: number
    subtotal: number
    total_amount: number
    payment_info: any
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

export default function ReceiptPreview() {
    const router = useRouter()
    const receiptRef = useRef<HTMLDivElement>(null)

    const [draft, setDraft] = useState<ReceiptDraft | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Read from session storage
                const savedDraft = sessionStorage.getItem('receipt_draft')
                if (!savedDraft) {
                    toast.error('ไม่พบข้อมูลร่างใบเสร็จ')
                    router.push('/auth/receipt')
                    return
                }
                setDraft(JSON.parse(savedDraft))

                const [pRes, pmRes] = await Promise.all([
                    fetch('/api/profile'),
                    fetch('/api/payment-methods')
                ])
                if (pRes.ok) setProfile(await pRes.json())
                if (pmRes.ok) setPaymentMethods(await pmRes.json())
            } catch (err) {
                toast.error('ไม่สามารถโหลดข้อมูลได้')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [router])

    const handleSaveAndDownload = React.useCallback(async () => {
        if (!draft) return
        setIsSaving(true)

        try {
            // 1. Save to Supabase
            const res = await fetch('/api/receipts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft)
            })

            if (!res.ok) throw new Error('Failed to save receipt')
            const savedReceipt = await res.json()

            // 2. Generate PDF using current ref
            if (receiptRef.current) {
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
                pdf.save(`receipt-${savedReceipt.receipt_number}.pdf`)
            }

            // 3. Cleanup and Redirect
            sessionStorage.removeItem('receipt_draft')
            toast.success('บันทึกข้อมูลและสร้างใบเสร็จสำเร็จ')
            router.push(`/auth/receipt/${savedReceipt.id}`)
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        } finally {
            setIsSaving(false)
        }
    }, [draft, router])

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">กำลังเตรียมตัวอย่างใบเสร็จ...</p>
        </div>
    )

    if (!draft) return null

    const selectedPaymentMethods = React.useMemo(() => paymentMethods.filter(pm =>
        draft?.payment_info?.selected_ids?.includes(pm.id)
    ), [paymentMethods, draft?.payment_info?.selected_ids])

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-full">
                    <Edit className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold">โหมดตัวอย่าง (ยังไม่ได้บันทึก)</p>
                    <p className="text-sm">ตรวจสอบความถูกต้องก่อนกดบันทึกข้อมูลลงระบบ</p>
                </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-background/80 backdrop-blur-md p-4 rounded-2xl sticky top-4 z-10 border shadow-sm">
                <div className="flex gap-2">
                    <Button variant="ghost" className="rounded-full" onClick={() => router.back()}>
                        <Edit className="h-4 w-4 mr-2" /> กลับไปแก้ไข
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" /> พิมพ์
                    </Button>
                    <Button className="rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white border-none" onClick={handleSaveAndDownload} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        บันทึกลงระบบ และดาวน์โหลด PDF
                    </Button>
                </div>
            </div>

            {/* --- RECEIPT A4 AREA --- */}
            <Card className="rounded-none border-none shadow-2xl bg-white mx-auto overflow-hidden">
                <div
                    ref={receiptRef}
                    className="w-[210mm] min-h-[297mm] p-[15mm] text-slate-800 bg-white shadow-inner mx-auto relative printable-content"
                    style={{ fontStyle: 'normal' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                        <div>
                            {profile?.shop_logo_url && (
                                <img src={profile.shop_logo_url} alt="Logo" className="h-16 mb-4 object-contain" />
                            )}
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{profile?.shop_name || 'BITSYNC SHOP'}</h1>
                            <p className="text-sm text-slate-500 max-w-xs mt-2 leading-relaxed whitespace-pre-wrap">
                                {profile?.address || 'ไม่ระบุที่อยู่'}
                                <br />
                                โทร: {profile?.phone || '-'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="bg-slate-900 text-white px-6 py-2 rounded-lg mb-4 inline-block">
                                <h2 className="text-xl font-bold uppercase tracking-widest">ใบเสร็จรับเงิน (ตัวอย่าง)</h2>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">เลขที่ใบเสร็จ</p>
                                <p className="text-xl font-mono font-bold text-slate-900">PREVIEW-FILE</p>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">วันที่</p>
                                <p className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">ข้อมูลลูกค้า</h3>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-slate-900">{draft.customer_name}</p>
                                <p className="text-md text-slate-500">{draft.customer_phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="p-4 text-left rounded-tl-lg font-bold uppercase tracking-widest text-xs">รายการสินค้า</th>
                                <th className="p-4 text-center font-bold uppercase tracking-widest text-xs">จำนวน</th>
                                <th className="p-4 text-right font-bold uppercase tracking-widest text-xs">ราคา/หน่วย</th>
                                <th className="p-4 text-right rounded-tr-lg font-bold uppercase tracking-widest text-xs">รวม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100">
                            {draft.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                    </td>
                                    <td className="p-4 text-center text-slate-600">{item.quantity}</td>
                                    <td className="p-4 text-right text-slate-600">฿{item.price.toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold text-slate-900">฿{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                            {draft.labor_cost > 0 && (
                                <tr className="bg-slate-50/50">
                                    <td className="p-4 italic text-slate-500">ค่าแรง / ค่าบริการ</td>
                                    <td className="p-4 text-center">-</td>
                                    <td className="p-4 text-right">-</td>
                                    <td className="p-4 text-right font-bold text-slate-900">฿{draft.labor_cost.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Summary Section */}
                    <div className="flex justify-between gap-12">
                        {/* Payment Info & QR */}
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">ช่องทางการชำระเงิน</h3>
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
                                                <div className="mt-2 p-2 bg-white border border-slate-100 rounded-lg inline-block">
                                                    <QRCodeSVG
                                                        value={generatePayload(pm.promptpay_number, { amount: draft.total_amount })}
                                                        size={100}
                                                        level="M"
                                                    />
                                                    <p className="text-[10px] text-center mt-1 font-bold text-slate-400">SCAN TO PAY</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="w-[30%]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">รวมค่าสินค้า</span>
                                    <span className="font-bold">฿{draft.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">ค่าแรง/ค่าบริการ</span>
                                    <span className="font-bold">฿{draft.labor_cost.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-black uppercase text-slate-900 tracking-widest">รวมยอดสุทธิ</span>
                                    <span className="text-2xl font-black text-slate-900">฿{draft.total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="mt-20 pt-8 border-t border-slate-200 text-center">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">ผู้รับเงิน / Receiver Signature</p>
                                <div className="mt-12 h-px bg-slate-900 w-full mx-auto" />
                                <p className="mt-2 text-sm font-bold text-slate-400">({profile?.full_name || 'ผู้รับเงิน'})</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <style jsx global>{`
                @media print {
                    .no-print, nav, aside, button, .action-bar { display: none !important; }
                    body { background: white; padding: 0; margin: 0; }
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
