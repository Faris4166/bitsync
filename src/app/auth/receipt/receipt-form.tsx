'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Receipt, User, Phone, Package, Wallet, Check, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

type Product = {
    id: string
    name: string
    price: number
    quantity: number
}

type PaymentMethod = {
    id: string
    type: 'promptpay' | 'bank_account'
    promptpay_number?: string
    bank_name?: string
    account_number?: string
    account_name?: string
}

export default function ReceiptForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

    // Receipt State
    const [customer, setCustomer] = useState({ name: '', phone: '' })
    const [selectedItems, setSelectedItems] = useState<{ id: string, name: string, price: number, quantity: number }[]>([])
    const [laborCost, setLaborCost] = useState(0)
    const [selectedPayments, setSelectedPayments] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const [pRes, pmRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/payment-methods')
            ])
            if (pRes.ok) setProducts(await pRes.json())
            if (pmRes.ok) setPaymentMethods(await pmRes.json())

            // Load draft from session storage if exists
            const savedDraft = sessionStorage.getItem('receipt_draft')
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft)
                    setCustomer({ name: draft.customer_name, phone: draft.customer_phone })
                    setSelectedItems(draft.items || [])
                    setLaborCost(draft.labor_cost || 0)
                    setSelectedPayments(draft.payment_info?.selected_ids || [])
                } catch (e) {
                    console.error('Error parsing draft:', e)
                }
            }
        }
        fetchData()
    }, [])

    const addItem = () => {
        setSelectedItems([...selectedItems, { id: '', name: '', price: 0, quantity: 1 }])
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...selectedItems]
        if (field === 'id') {
            const prod = products.find(p => p.id === value)
            if (prod) {
                newItems[index] = { ...newItems[index], id: prod.id, name: prod.name, price: Number(prod.price) }
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value }
        }
        setSelectedItems(newItems)
    }

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal + laborCost

    const handleSubmit = async () => {
        if (!customer.name) return toast.error('กรุณาระบุชื่อลูกค้า')
        if (selectedItems.length === 0) return toast.error('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')

        const draftData = {
            customer_name: customer.name,
            customer_phone: customer.phone,
            items: selectedItems,
            labor_cost: laborCost,
            subtotal,
            total_amount: total,
            payment_info: {
                selected_ids: selectedPayments
            }
        }

        // Save to session storage instead of database
        sessionStorage.setItem('receipt_draft', JSON.stringify(draftData))
        router.push('/auth/receipt/preview')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">สร้างใบเสร็จใหม่</h1>
                    <p className="text-muted-foreground">ออกใบเสร็จรับเงินอย่างเป็นทางการให้ลูกค้า</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* --- CUSTOMER INFO --- */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> ข้อมูลลูกค้า
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>ชื่อ-นามสกุล</Label>
                            <Input
                                placeholder="สมชาย ใจดี"
                                className="rounded-xl"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เบอร์โทรศัพท์</Label>
                            <Input
                                placeholder="08x-xxx-xxxx"
                                className="rounded-xl"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- ITEMS --- */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" /> รายการสินค้า
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addItem} className="rounded-full">
                            <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการ
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">สินค้า</TableHead>
                                    <TableHead>ราคา (฿)</TableHead>
                                    <TableHead className="w-[100px]">จำนวน</TableHead>
                                    <TableHead className="text-right">รวม</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="relative">
                                                <Input
                                                    list={`products-${index}`}
                                                    placeholder="ชื่อสินค้า (พิมพ์เองได้)"
                                                    className="rounded-lg h-9"
                                                    value={item.name}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        const prod = products.find(p => p.name === val)
                                                        if (prod) {
                                                            updateItem(index, 'id', prod.id)
                                                        } else {
                                                            updateItem(index, 'name', val)
                                                        }
                                                    }}
                                                />
                                                <datalist id={`products-${index}`}>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.name}>{p.name} (฿{p.price})</option>
                                                    ))}
                                                </datalist>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="rounded-lg h-9"
                                                value={item.price || ''}
                                                onChange={e => updateItem(index, 'price', Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="rounded-lg h-9"
                                                value={item.quantity || ''}
                                                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ฿{(item.price * item.quantity).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* --- TOTALS & LABOR --- */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" /> ค่าบริการ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>ค่าแรง / ค่าซ่อม (บาท)</Label>
                                <Input
                                    type="number"
                                    className="rounded-xl text-lg font-bold"
                                    placeholder="0.00"
                                    value={laborCost}
                                    onChange={e => setLaborCost(Number(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[3rem] border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Receipt className="h-32 w-32" />
                        </div>
                        <CardContent className="p-8 space-y-4">
                            <div className="flex justify-between items-center opacity-80">
                                <span>ค่าสินค้า</span>
                                <span>฿{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-80">
                                <span>ค่าแรง</span>
                                <span>฿{laborCost.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/20 my-2" />
                            <div className="flex justify-between items-center text-3xl font-black">
                                <span>รวมสุทธิ</span>
                                <span>฿{total.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- PAYMENT METHOD CHOICE --- */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary" /> ช่องทางการชำระเงิน
                        </CardTitle>
                        <CardDescription>เลือกช่องทางที่จะให้ปรากฏบนใบเสร็จ</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {paymentMethods.map((pm) => (
                            <div key={pm.id} className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={pm.id}
                                    checked={selectedPayments.includes(pm.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedPayments([...selectedPayments, pm.id])
                                        else setSelectedPayments(selectedPayments.filter(id => id !== pm.id))
                                    }}
                                />
                                <Label htmlFor={pm.id} className="flex-1 cursor-pointer">
                                    {pm.type === 'promptpay' ? (
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">PromptPay</span>
                                            <span className="text-muted-foreground">{pm.promptpay_number}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{pm.bank_name}</span>
                                            <span className="text-muted-foreground">{pm.account_number} ({pm.account_name})</span>
                                        </div>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-center border-t py-6">
                        <Button
                            className="w-full max-w-md rounded-full h-12 text-lg font-bold shadow-lg"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronRight className="mr-2 h-5 w-5" />}
                            ดูตัวอย่างใบเสร็จ
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
