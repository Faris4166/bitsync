'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Building2, User, CreditCard, Wallet, Upload, Image as ImageIcon, Smartphone } from 'lucide-react'
import { toast } from "sonner"
import useSWR, { mutate } from 'swr'

// --- Types ---
export type ProfileData = {
    full_name: string
    phone: string
    address: string
    shop_name: string
    shop_logo_url: string
}

export type PaymentMethodData = {
    id?: string
    type: 'promptpay' | 'bank_account'
    promptpay_type?: 'citizen_id' | 'phone_number' | null
    promptpay_number?: string | null
    bank_name?: string | null
    account_name?: string | null
    account_number?: string | null
    is_active?: boolean
}

// --- Types ---
type Props = {
    initialProfile: any
    initialPaymentMethods: any[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SettingsForm({ initialProfile, initialPaymentMethods }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Profile & Shop State
    const [profile, setProfile] = useState<ProfileData>({
        full_name: initialProfile?.full_name || '',
        phone: initialProfile?.phone || '',
        address: initialProfile?.address || '',
        shop_name: initialProfile?.shop_name || '',
        shop_logo_url: initialProfile?.shop_logo_url || ''
    })

    // Payment State
    const { data: paymentMethodsData } = useSWR<PaymentMethodData[]>('/api/payment-methods', fetcher, {
        fallbackData: initialPaymentMethods,
        revalidateOnFocus: true,
    })
    const paymentMethods = paymentMethodsData || []
    const [showAddPayment, setShowAddPayment] = useState(false)
    const [newPayment, setNewPayment] = useState<PaymentMethodData>({
        type: 'promptpay',
        promptpay_type: 'phone_number',
        promptpay_number: '',
        bank_name: '',
        account_name: '',
        account_number: '',
        is_active: true
    })

    React.useEffect(() => {
        // Sync profile when props change
        setProfile({
            full_name: initialProfile?.full_name || '',
            phone: initialProfile?.phone || '',
            address: initialProfile?.address || '',
            shop_name: initialProfile?.shop_name || '',
            shop_logo_url: initialProfile?.shop_logo_url || ''
        })
    }, [initialProfile])

    // --- API Helpers ---

    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Validate file size (e.g. 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 2MB)')
            return
        }

        setIsUploading(true)
        try {
            // 2. Read as base64
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = async () => {
                const base64Content = reader.result?.toString().split(',')[1]

                // 3. Send to API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        base64: base64Content
                    })
                })

                if (!res.ok) throw new Error('Upload failed')

                const data = await res.json()
                setProfile(prev => ({ ...prev, shop_logo_url: data.url }))
                toast.success('อัปโหลดรูปภาพเรียบร้อย')
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('เกิดข้อผิดพลาดในการอัปโหลด')
        } finally {
            setIsUploading(false)
        }
    }, [])


    // --- Handlers ---

    const handleProfileSubmit = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                const res = await fetch('/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile)
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    console.error('Profile update failed:', errorData)
                    throw new Error(errorData.error || errorData.details?.message || 'Failed to update profile')
                }

                toast.success('บันทึกข้อมูลเรียบร้อยแล้ว')
                router.refresh()
            } catch (err: any) {
                console.error(err)
                toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        })
    }, [profile, router])

    const handleAddPayment = React.useCallback(async () => {
        startTransition(async () => {
            try {
                const res = await fetch('/api/payment-methods', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPayment)
                })

                if (!res.ok) throw new Error('Failed to add payment method')

                setShowAddPayment(false)
                setNewPayment({
                    type: 'promptpay',
                    promptpay_type: 'phone_number',
                    promptpay_number: '',
                    bank_name: '',
                    account_name: '',
                    account_number: '',
                    is_active: true
                })

                mutate('/api/payment-methods')
                router.refresh()
                toast.success('เพิ่มช่องทางชำระเงินเรียบร้อย')
            } catch (err) {
                console.error(err)
                toast.error('เกิดข้อผิดพลาดในการเพิ่มช่องทางชำระเงิน')
            }
        })
    }, [newPayment, router])

    const handleDeletePayment = React.useCallback(async (id: string) => {
        if (!confirm('ยืนยันการลบช่องทางชำระเงิน?')) return

        startTransition(async () => {
            try {
                const res = await fetch(`/api/payment-methods?id=${id}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Failed to delete')

                mutate('/api/payment-methods')
                router.refresh()
                toast.success('ลบช่องทางชำระเงินเรียบร้อย')
            } catch (err) {
                console.error(err)
                toast.error('เกิดข้อผิดพลาดในการลบ')
            }
        })
    }, [router])

    return (
        <div className="w-full">
            <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-0 md:gap-12 min-h-[600px]">
                {/* --- Sidebar Navigation --- */}
                <div className="w-full md:w-64 shrink-0">
                    <TabsList className="flex flex-row md:flex-col h-auto w-full justify-start bg-transparent p-0 gap-1 overflow-x-auto no-scrollbar border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center justify-start gap-3 w-full rounded-xl px-4 py-3 font-bold text-sm transition-all duration-200
                                       text-muted-foreground hover:text-foreground hover:bg-accent/50
                                       data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            <User className="h-4 w-4" />
                            <span>ข้อมูลส่วนตัว</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="shop"
                            className="flex items-center justify-start gap-3 w-full rounded-xl px-4 py-3 font-bold text-sm transition-all duration-200
                                       text-muted-foreground hover:text-foreground hover:bg-accent/50
                                       data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            <Building2 className="h-4 w-4" />
                            <span>ข้อมูลร้านค้า</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="payment"
                            className="flex items-center justify-start gap-3 w-full rounded-xl px-4 py-3 font-bold text-sm transition-all duration-200
                                       text-muted-foreground hover:text-foreground hover:bg-accent/50
                                       data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            <Wallet className="h-4 w-4" />
                            <span>ช่องทางการชำระเงิน</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* --- Main Content Area --- */}
                <div className="flex-1 mt-8 md:mt-0 max-w-3xl">
                    {/* --- PROFILE TAB content --- */}
                    <TabsContent value="profile" className="focus-visible:outline-none m-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-8">
                            <div className="space-y-1 px-1">
                                <h2 className="text-2xl font-bold tracking-tight">ข้อมูลส่วนตัว</h2>
                                <p className="text-sm font-medium text-muted-foreground">จัดการข้อมูลตัวตนและรายละเอียดการติดต่อของคุณ</p>
                            </div>

                            <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
                                <form onSubmit={handleProfileSubmit}>
                                    <CardContent className="space-y-8 p-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="grid gap-3">
                                                <Label htmlFor="full_name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ชื่อ-นามสกุล</Label>
                                                <Input
                                                    id="full_name"
                                                    className="rounded-xl h-12 border-border/60 bg-background/50 focus-visible:ring-primary/20 transition-all font-medium"
                                                    value={profile.full_name}
                                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">เบอร์โทรศัพท์</Label>
                                                <Input
                                                    id="phone"
                                                    className="rounded-xl h-12 border-border/60 bg-background/50 focus-visible:ring-primary/20 transition-all font-medium"
                                                    value={profile.phone}
                                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                    placeholder="08x-xxx-xxxx"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="address" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ที่อยู่ร้านค้า / ที่อยู่สำหรับใบเสร็จ</Label>
                                            <Textarea
                                                id="address"
                                                className="min-h-[160px] rounded-xl border-border/60 bg-background/50 p-4 focus-visible:ring-primary/20 transition-all font-medium resize-none leading-relaxed"
                                                value={profile.address}
                                                onChange={e => setProfile({ ...profile, address: e.target.value })}
                                                placeholder="Your detailed address for receipts..."
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end border-t border-border/50 p-6 bg-muted/5">
                                        <Button type="submit" className="rounded-xl h-11 px-8 font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground" disabled={isPending}>
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            บันทึกข้อมูล
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </section>
                    </TabsContent>

                    {/* --- SHOP TAB content --- */}
                    <TabsContent value="shop" className="focus-visible:outline-none m-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-8">
                            <div className="space-y-1 px-1">
                                <h2 className="text-2xl font-bold tracking-tight">แบรนด์ร้านค้า</h2>
                                <p className="text-sm font-medium text-muted-foreground">เอกลักษณ์ธุรกิจของคุณที่จะปรากฏบนใบเสร็จและแดชบอร์ด</p>
                            </div>

                            <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
                                <form onSubmit={handleProfileSubmit}>
                                    <CardContent className="space-y-10 p-8">
                                        <div className="grid gap-8">
                                            <div className="grid gap-3">
                                                <Label htmlFor="shop_name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ชื่อร้านค้า</Label>
                                                <Input
                                                    id="shop_name"
                                                    className="rounded-xl h-12 border-border/60 bg-background/50 focus-visible:ring-primary/20 transition-all font-medium"
                                                    value={profile.shop_name}
                                                    onChange={e => setProfile({ ...profile, shop_name: e.target.value })}
                                                    placeholder="Your business name"
                                                />
                                            </div>

                                            <div className="grid gap-3">
                                                <Label htmlFor="logo" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">โลโก้ร้านค้า</Label>
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-1">
                                                    <div className="relative group overflow-hidden bg-muted/20 border border-dashed border-border/60 rounded-2xl w-40 h-40 flex items-center justify-center transition-all hover:border-primary/40 hover:bg-muted/30 shadow-inner">
                                                        {profile.shop_logo_url ? (
                                                            <img
                                                                src={profile.shop_logo_url}
                                                                alt="Logo Preview"
                                                                className="w-full h-full object-contain p-6 drop-shadow-sm transition-transform group-hover:scale-105 duration-500"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center text-muted-foreground/30">
                                                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Logo</span>
                                                            </div>
                                                        )}
                                                        {isUploading && (
                                                            <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-4 mt-2">
                                                        <div className="relative">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-xl h-11 px-6 border-border font-bold transition-all shadow-sm hover:shadow-md bg-background"
                                                                disabled={isUploading}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Upload Image
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                    accept="image/*"
                                                                    onChange={handleFileUpload}
                                                                />
                                                            </Button>
                                                        </div>
                                                        <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed max-w-[180px]">
                                                            High resolution PNG or JPG recommended (Max 2MB).
                                                        </p>
                                                        {profile.shop_logo_url && (
                                                            <Button
                                                                type="button"
                                                                variant="link"
                                                                size="sm"
                                                                className="text-destructive h-auto p-0 font-bold text-xs justify-start opacity-70 hover:opacity-100 transition-opacity"
                                                                onClick={() => setProfile({ ...profile, shop_logo_url: '' })}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" /> ลบโลโก้ปัจจุบัน
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end border-t border-border/50 p-6 bg-muted/5">
                                        <Button type="submit" className="rounded-xl h-11 px-8 font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground" disabled={isPending}>
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            บันทึกแบรนด์
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </section>
                    </TabsContent>

                    {/* --- PAYMENT TAB content --- */}
                    <TabsContent value="payment" className="focus-visible:outline-none m-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">ช่องทางการชำระเงิน</h2>
                                    <p className="text-sm font-medium text-muted-foreground">กำหนดช่องทางรับเงินจากลูกค้าของคุณ</p>
                                </div>
                                <Button onClick={() => setShowAddPayment(true)} className="rounded-xl h-11 px-6 font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0">
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มบัญชีรับเงิน
                                </Button>
                            </div>

                            {paymentMethods.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-[2rem] bg-muted/5 border-border/40">
                                    <div className="p-5 rounded-full bg-muted/20 mb-6">
                                        <Wallet className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">ยังไม่มีช่องทางการชำระเงิน</h3>
                                    <p className="text-sm text-muted-foreground max-w-[320px] mt-2 leading-relaxed opacity-80">
                                        เพิ่มบัญชี PromptPay หรือบัญชีธนาคารเพื่อรับชำระเงินผ่านใบเสร็จดิจิทัล
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {paymentMethods.map(pm => (
                                        <div key={pm.id} className="group flex items-center justify-between p-6 rounded-2xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-xl shadow-inner bg-muted/30 border border-border/40 ${pm.type === 'promptpay' ? 'text-primary' : 'text-primary'}`}>
                                                    {pm.type === 'promptpay' ? <Smartphone className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">
                                                        {pm.type === 'promptpay' ? 'PromptPay' : pm.bank_name}
                                                    </h4>
                                                    <p className="text-muted-foreground/70 text-sm font-bold tracking-tight mt-1.5 font-mono">
                                                        {pm.type === 'promptpay'
                                                            ? `${pm.promptpay_number} (${pm.promptpay_type === 'phone_number' ? 'Phone' : 'National ID'})`
                                                            : `${pm.account_number} • ${pm.account_name}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 rounded-xl h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleDeletePayment(pm.id!)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showAddPayment && (
                                <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                                    <CardHeader className="pb-6 pt-10 px-10">
                                        <CardTitle className="text-xl font-bold tracking-tight">เพิ่มช่องทางชำระเงิน</CardTitle>
                                        <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">ACCOUNT CONFIGURATION</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-10 px-10 pb-8">
                                        <div className="grid gap-4">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ประเภทบัญชี</Label>
                                            <Select
                                                value={newPayment.type}
                                                onValueChange={val => setNewPayment({ ...newPayment, type: val as any })}
                                            >
                                                <SelectTrigger className="w-full h-12 rounded-xl bg-background border-border/60 font-medium">
                                                    <SelectValue placeholder="เลือกประเภท" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="promptpay">พร้อมเพย์ (รองรับ QR)</SelectItem>
                                                    <SelectItem value="bank_account">บัญชีธนาคาร</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newPayment.type === 'promptpay' ? (
                                            <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                                                <div className="grid gap-4">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ประเภทพร้อมเพย์</Label>
                                                    <Select
                                                        value={newPayment.promptpay_type || 'phone_number'}
                                                        onValueChange={val => setNewPayment({ ...newPayment, promptpay_type: val as any })}
                                                    >
                                                        <SelectTrigger className="w-full h-12 rounded-xl bg-background border-border/60">
                                                            <SelectValue placeholder="เลือกประเภท" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="phone_number">เบอร์โทรศัพท์</SelectItem>
                                                            <SelectItem value="citizen_id">เลขบัตรประชาชน</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-4">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">เลขพร้อมเพย์</Label>
                                                    <Input
                                                        className="h-12 rounded-xl bg-background border-border/60 font-mono font-bold"
                                                        value={newPayment.promptpay_number || ''}
                                                        onChange={e => setNewPayment({ ...newPayment, promptpay_number: e.target.value })}
                                                        placeholder={newPayment.promptpay_type === 'phone_number' ? "08..." : "1234..."}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                                                <div className="grid gap-4">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ชื่อธนาคาร</Label>
                                                    <Input
                                                        className="h-12 rounded-xl bg-background border-border/60 font-medium"
                                                        value={newPayment.bank_name || ''}
                                                        onChange={e => setNewPayment({ ...newPayment, bank_name: e.target.value })}
                                                        placeholder="e.g. KBank, SCB"
                                                    />
                                                </div>
                                                <div className="grid gap-4">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">เลขบัญชี</Label>
                                                    <Input
                                                        className="h-12 rounded-xl bg-background border-border/60 font-mono font-bold"
                                                        value={newPayment.account_number || ''}
                                                        onChange={e => setNewPayment({ ...newPayment, account_number: e.target.value })}
                                                        placeholder="xxx-x-xxxxx-x"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 grid gap-4">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ชื่อบัญชี</Label>
                                                    <Input
                                                        className="h-12 rounded-xl bg-background border-border/60 font-medium"
                                                        value={newPayment.account_name || ''}
                                                        onChange={e => setNewPayment({ ...newPayment, account_name: e.target.value })}
                                                        placeholder="Name on bank account"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="justify-end gap-3 border-t border-border/20 p-8 bg-muted/5">
                                        <Button variant="ghost" size="sm" onClick={() => setShowAddPayment(false)} disabled={isPending} className="rounded-xl font-bold px-6">
                                            ยกเลิก
                                        </Button>
                                        <Button size="sm" onClick={handleAddPayment} disabled={isPending} className="rounded-xl font-bold h-11 px-8">
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            เพิ่มบัญชี
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </section>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
