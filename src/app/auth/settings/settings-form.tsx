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
import { Loader2, Plus, Trash2, Building2, User, CreditCard, Wallet, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from "sonner"

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
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>(initialPaymentMethods || [])
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

    // Sync state with props when they change (e.g. after router.refresh())
    React.useEffect(() => {
        setProfile({
            full_name: initialProfile?.full_name || '',
            phone: initialProfile?.phone || '',
            address: initialProfile?.address || '',
            shop_name: initialProfile?.shop_name || '',
            shop_logo_url: initialProfile?.shop_logo_url || ''
        })
    }, [initialProfile])

    React.useEffect(() => {
        setPaymentMethods(initialPaymentMethods || [])
    }, [initialPaymentMethods])

    // --- API Helpers ---

    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }

    const fetchPaymentMethods = async () => {
        try {
            const res = await fetch('/api/payment-methods')
            if (res.ok) {
                const data = await res.json()
                setPaymentMethods(data)
            }
        } catch (err) {
            console.error('Error fetching payment methods:', err)
        }
    }

    // --- Handlers ---

    const handleProfileSubmit = async (e: React.FormEvent) => {
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
    }

    const handleAddPayment = async () => {
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

                await fetchPaymentMethods()
                router.refresh()
                toast.success('เพิ่มช่องทางชำระเงินเรียบร้อย')
            } catch (err) {
                console.error(err)
                toast.error('เกิดข้อผิดพลาดในการเพิ่มช่องทางชำระเงิน')
            }
        })
    }

    const handleDeletePayment = async (id: string) => {
        if (!confirm('ยืนยันการลบช่องทางชำระเงิน?')) return

        startTransition(async () => {
            try {
                const res = await fetch(`/api/payment-methods?id=${id}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Failed to delete')

                setPaymentMethods(prev => prev.filter(p => p.id !== id))
                router.refresh()
                toast.success('ลบช่องทางชำระเงินเรียบร้อย')
            } catch (err) {
                console.error(err)
                toast.error('เกิดข้อผิดพลาดในการลบ')
            }
        })
    }

    return (
        <div className="w-full space-y-6">
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>ส่วนตัว</span>
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>ร้านค้า</span>
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>การชำระเงิน</span>
                    </TabsTrigger>
                </TabsList>

                {/* --- PROFILE TAB content --- */}
                <TabsContent value="profile" className="mt-0 focus-visible:outline-none w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                            <CardDescription>จัดการข้อมูลติดต่อส่วนตัวสำหรับการสื่อสารในระบบ</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProfileSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                                        <Input
                                            id="full_name"
                                            value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                            placeholder="กรอกชื่อ-นามสกุลจริง"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                        <Input
                                            id="phone"
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="08x-xxx-xxxx"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">ที่อยู่ติดต่อ</Label>
                                    <Textarea
                                        id="address"
                                        className="min-h-[120px]"
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        placeholder="ที่อยู่สำหรับจัดส่งเอกสารและข้อมูลอื่นๆ"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t p-4 px-6 bg-muted/20">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    บันทึกข้อมูลส่วนตัว
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- SHOP TAB content --- */}
                <TabsContent value="shop" className="mt-0 focus-visible:outline-none w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>ข้อมูลร้านค้า</CardTitle>
                            <CardDescription>ข้อมูลแบรนด์ที่จะปรากฏบนใบเสร็จและหน้าจัดการทั้งหมด</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProfileSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="shop_name">ชื่อร้านค้า</Label>
                                        <Input
                                            id="shop_name"
                                            value={profile.shop_name}
                                            onChange={e => setProfile({ ...profile, shop_name: e.target.value })}
                                            placeholder="ระบุชื่อร้านค้าของคุณ"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="logo">โลโก้ร้านค้า</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group overflow-hidden bg-muted/20 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center transition-all hover:bg-muted/30">
                                                {profile.shop_logo_url ? (
                                                    <img
                                                        src={profile.shop_logo_url}
                                                        alt="Logo Preview"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8 mb-1 opacity-20" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight opacity-40">No Logo</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="relative"
                                                    disabled={isUploading}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    เลือกรูปภาพ
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                    />
                                                </Button>
                                                <p className="text-[10px] text-muted-foreground">PNG, JPG ขนาดไม่เกิน 2MB</p>
                                                {profile.shop_logo_url && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive h-7 px-2"
                                                        onClick={() => setProfile({ ...profile, shop_logo_url: '' })}
                                                    >
                                                        ลบรูปภาพ
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t p-4 px-6 bg-muted/20">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    บันทึกข้อมูลร้านค้า
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- PAYMENT TAB content --- */}
                <TabsContent value="payment" className="mt-0 focus-visible:outline-none space-y-6 w-full">
                    <Card className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>ช่องทางการชำระเงิน</CardTitle>
                                <CardDescription>บัญชีรับเงินสำหรับสร้างใบเสร็จและแจ้งลูกค้า</CardDescription>
                            </div>
                            <Button onClick={() => setShowAddPayment(true)} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> เพิ่มช่องทางใหม่
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {paymentMethods.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/5">
                                    <Wallet className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <h3 className="font-bold text-muted-foreground">ยังไม่ได้เพิ่มช่องทางชำระเงิน</h3>
                                    <p className="text-sm text-muted-foreground opacity-60">เริ่มรับเงินด้วยการเพิ่มบัญชีธนาคารหรือ PromptPay</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {paymentMethods.map(pm => (
                                        <div key={pm.id} className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-lg ${pm.type === 'promptpay' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {pm.type === 'promptpay' ? <CreditCard className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">
                                                        {pm.type === 'promptpay' ? 'QR PromptPay' : pm.bank_name}
                                                    </h4>
                                                    <p className="text-muted-foreground text-xs font-medium opacity-70">
                                                        {pm.type === 'promptpay'
                                                            ? `${pm.promptpay_number} (${pm.promptpay_type === 'phone_number' ? 'มือถือ' : 'บัตร ปชช.'})`
                                                            : `${pm.account_number} • ${pm.account_name}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                onClick={() => handleDeletePayment(pm.id!)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {showAddPayment && (
                        <Card className="rounded-[2rem] border-blue-500/20 bg-blue-500/5 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <CardHeader>
                                <CardTitle className="text-lg">เพิ่มช่องทางชำระเงินใหม่</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label>ประเภทบัญชี</Label>
                                    <Select
                                        value={newPayment.type}
                                        onValueChange={val => setNewPayment({ ...newPayment, type: val as any })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="เลือกประเภทบัญชี" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="promptpay">QR PromptPay (พร้อมเพย์)</SelectItem>
                                            <SelectItem value="bank_account">บัญชีธนาคาร</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newPayment.type === 'promptpay' ? (
                                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ประเภทพร้อมเพย์</Label>
                                            <Select
                                                value={newPayment.promptpay_type || 'phone_number'}
                                                onValueChange={val => setNewPayment({ ...newPayment, promptpay_type: val as any })}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="เลือกประเภทพร้อมเพย์" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone_number">เบอร์โทรศัพท์ (08x...)</SelectItem>
                                                    <SelectItem value="citizen_id">เลขบัตรประชาชน (13 หลัก)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">หมายเลขพร้อมเพย์</Label>
                                            <Input
                                                value={newPayment.promptpay_number || ''}
                                                onChange={e => setNewPayment({ ...newPayment, promptpay_number: e.target.value })}
                                                placeholder={newPayment.promptpay_type === 'phone_number' ? "0812345678" : "1234567890123"}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ชื่อธนาคาร</Label>
                                            <Input
                                                value={newPayment.bank_name || ''}
                                                onChange={e => setNewPayment({ ...newPayment, bank_name: e.target.value })}
                                                placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">เลขที่บัญชี</Label>
                                            <Input
                                                value={newPayment.account_number || ''}
                                                onChange={e => setNewPayment({ ...newPayment, account_number: e.target.value })}
                                                placeholder="xxx-x-xxxxx-x"
                                            />
                                        </div>
                                        <div className="md:col-span-2 grid gap-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ชื่อบัญชี</Label>
                                            <Input
                                                value={newPayment.account_name || ''}
                                                onChange={e => setNewPayment({ ...newPayment, account_name: e.target.value })}
                                                placeholder="ชื่อเจ้าของบัญชีภาษาไทยหรืออังกฤษ"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="justify-end gap-3 border-t p-4 px-6 bg-muted/20">
                                <Button variant="ghost" onClick={() => setShowAddPayment(false)} disabled={isPending}>
                                    ยกเลิก
                                </Button>
                                <Button onClick={handleAddPayment} disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    สร้างช่องทางใหม่
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
