'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Receipt, User, Phone, Package, Wallet, Check, ChevronRight, Loader2, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useLanguage } from '@/components/language-provider'

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ReceiptForm() {
    const { t, language } = useLanguage()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { data: productsData } = useSWR<Product[]>('/api/products', fetcher)
    const { data: paymentMethodsData } = useSWR<PaymentMethod[]>('/api/payment-methods', fetcher)
    const { data: customersData } = useSWR<{ name: string, phone: string }[]>('/api/customers', fetcher)

    const products = productsData || []
    const paymentMethods = paymentMethodsData || []
    const existingCustomers = customersData || []

    // Receipt State
    const [customer, setCustomer] = useState({ name: '', phone: '' })
    const [customerOpen, setCustomerOpen] = useState(false) // For Combobox
    const [selectedItems, setSelectedItems] = useState<{ id: string, name: string, price: number, quantity: number }[]>([])
    const [laborCost, setLaborCost] = useState(0)
    const [selectedPayments, setSelectedPayments] = useState<string[]>([])

    useEffect(() => {
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
    }, [])

    const addItem = React.useCallback(() => {
        setSelectedItems(prev => [...prev, { id: '', name: '', price: 0, quantity: 1 }])
    }, [])

    const updateItem = React.useCallback((index: number, field: string, value: any) => {
        setSelectedItems(prev => {
            const newItems = [...prev]
            if (field === 'id') {
                const prod = products.find(p => p.id === value)
                if (prod) {
                    newItems[index] = { ...newItems[index], id: prod.id, name: prod.name, price: Number(prod.price) }
                }
            } else {
                newItems[index] = { ...newItems[index], [field]: value }
            }
            return newItems
        })
    }, [products])

    const subtotal = React.useMemo(() => selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [selectedItems])
    const total = React.useMemo(() => subtotal + laborCost, [subtotal, laborCost])

    const handleSubmit = React.useCallback(async () => {
        if (!customer.name) return toast.error(t('receipt.error_name'))
        if (selectedItems.length === 0) return toast.error(t('receipt.error_items'))

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
    }, [customer, selectedItems, laborCost, subtotal, total, selectedPayments, router])

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('receipt.create_new')}</h1>
                    <p className="text-muted-foreground">{t('receipt.subtitle')}</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* --- CUSTOMER INFO --- */}
                <Card className="rounded-xl border border-border shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> {t('receipt.customer_info')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-semibold text-muted-foreground">{t('receipt.customer_name')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t('receipt.search_customer')}
                                    className="rounded-lg h-10 border-border"
                                    value={customer.name}
                                    onChange={(e) => {
                                        setCustomer(prev => ({ ...prev, name: e.target.value }))
                                    }}
                                />
                                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 border-border"
                                        >
                                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder={t('receipt.search_customer')} />
                                            <CommandList>
                                                <CommandEmpty>{t('receipt.no_customer')}</CommandEmpty>
                                                <CommandGroup heading={t('receipt.old_customer')}>
                                                    {existingCustomers.map((c) => (
                                                        <CommandItem
                                                            key={c.name}
                                                            value={c.name}
                                                            onSelect={() => {
                                                                setCustomer({ name: c.name, phone: c.phone })
                                                                setCustomerOpen(false)
                                                                toast.success(t('receipt.load_success'))
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    customer.name === c.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{c.name}</span>
                                                                {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-muted-foreground">{t('receipt.customer_phone')}</Label>
                            <Input
                                placeholder="08x-xxx-xxxx"
                                className="rounded-lg h-10 border-border"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- ITEMS --- */}
                <Card className="rounded-xl border border-border shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" /> {t('receipt.items')}
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addItem} className="rounded-lg border-border font-semibold px-4">
                            <Plus className="h-4 w-4 mr-1.5" /> {t('receipt.add_item')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="w-[40%] font-semibold">{t('common.name')}</TableHead>
                                        <TableHead className="font-semibold">{t('common.price')} (฿)</TableHead>
                                        <TableHead className="w-[100px] font-semibold">{t('common.quantity')}</TableHead>
                                        <TableHead className="text-right font-semibold">{t('common.total')}</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedItems.map((item, index) => (
                                        <TableRow key={index} className="border-border/20">
                                            <TableCell className="align-top pt-4">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder={t('common.name') + "..."}
                                                        className="rounded-lg h-10 border-border/40 bg-background/50 min-w-[120px]"
                                                        value={item.name}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            updateItem(index, 'name', val)
                                                            // Clear ID when typing manually to treat as new item
                                                            updateItem(index, 'id', '')
                                                        }}
                                                    />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-10 w-10 shrink-0 border-border/40"
                                                            >
                                                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[300px] p-0" align="start">
                                                            <Command>
                                                                <CommandInput placeholder={t('receipt.search_product')} />
                                                                <CommandList>
                                                                    <CommandEmpty>{t('receipt.no_product')}</CommandEmpty>
                                                                    <CommandGroup heading={t('receipt.inventory_products')}>
                                                                        {products.map((product) => (
                                                                            <CommandItem
                                                                                key={product.id}
                                                                                value={product.name}
                                                                                onSelect={() => {
                                                                                    updateItem(index, 'id', product.id)
                                                                                    updateItem(index, 'name', product.name)
                                                                                    updateItem(index, 'price', product.price)
                                                                                    // Keep quantity as is or reset? Keep as is usually better UX
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        item.id === product.id ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span>{product.name}</span>
                                                                                    <span className="text-xs text-muted-foreground">฿{product.price} | คงเหลือ: {product.quantity}</span>
                                                                                </div>
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top pt-4">
                                                <Input
                                                    type="number"
                                                    className="rounded-lg h-10 border-border/40 bg-background/50"
                                                    value={item.price || ''}
                                                    onChange={e => updateItem(index, 'price', Number(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="align-top pt-4">
                                                <Input
                                                    type="number"
                                                    className="rounded-lg h-10 border-border/40 bg-background/50"
                                                    value={item.quantity || ''}
                                                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-bold align-top pt-6">
                                                ฿{(item.price * item.quantity).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="align-top pt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {selectedItems.map((item, index) => (
                                <div key={index} className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">สินค้า</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-10 bg-background/50 border-border/40 font-normal",
                                                        !item.name && "text-muted-foreground"
                                                    )}
                                                >
                                                    {item.name || t('receipt.select_product')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder={t('receipt.search_product')} />
                                                    <CommandList>
                                                        <CommandEmpty>{t('receipt.no_product')}</CommandEmpty>
                                                        <CommandGroup>
                                                            {products.map((product) => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.name}
                                                                    onSelect={() => {
                                                                        updateItem(index, 'id', product.id)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            item.id === product.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{product.name}</span>
                                                                        <span className="text-xs text-muted-foreground">฿{product.price} | คงเหลือ: {product.quantity}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">ราคา (฿)</Label>
                                            <Input
                                                type="number"
                                                className="rounded-lg h-10 border-border/40 bg-background/50"
                                                value={item.price || ''}
                                                onChange={e => updateItem(index, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">จำนวน</Label>
                                            <Input
                                                type="number"
                                                className="rounded-lg h-10 border-border/40 bg-background/50 text-center"
                                                value={item.quantity || ''}
                                                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">รวม:</span>
                                            <span className="text-lg font-bold text-primary">฿{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10 -mr-2"
                                            onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* --- TOTALS & LABOR --- */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="rounded-xl border border-border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" /> {t('receipt.labor_fee')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label className="font-semibold text-muted-foreground border-none">{t('receipt.labor_fee')} (฿)</Label>
                                <Input
                                    type="number"
                                    className="rounded-lg h-12 text-xl font-bold border-border"
                                    placeholder="0.00"
                                    value={laborCost}
                                    onChange={e => setLaborCost(Number(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border bg-primary text-primary-foreground shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Receipt className="h-32 w-32" />
                        </div>
                        <CardContent className="p-8 space-y-5 relative z-10">
                            <div className="flex justify-between items-center opacity-70 text-xs font-bold tracking-widest uppercase">
                                <span>{t('receipt.subtotal')}</span>
                                <span>฿{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-70 text-xs font-bold tracking-widest uppercase">
                                <span>{t('receipt.labor_fee')}</span>
                                <span>฿{laborCost.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex justify-between items-end">
                                <span className="font-bold opacity-60 text-xs uppercase tracking-widest">{t('receipt.total_net')}</span>
                                <span className="text-4xl font-bold tracking-tight">฿{total.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- PAYMENT METHOD CHOICE --- */}
                <Card className="rounded-xl border border-border shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary" /> {t('receipt.payment_choice')}
                        </CardTitle>
                        <CardDescription className="font-medium">{t('receipt.payment_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {paymentMethods.map((pm) => (
                            <div key={pm.id} className="flex items-center space-x-4 p-4 border border-border rounded-xl hover:bg-accent transition-all group cursor-pointer" onClick={() => {
                                if (selectedPayments.includes(pm.id)) setSelectedPayments(selectedPayments.filter(id => id !== pm.id))
                                else setSelectedPayments([...selectedPayments, pm.id])
                            }}>
                                <Checkbox
                                    id={pm.id}
                                    className="rounded-lg h-6 w-6"
                                    checked={selectedPayments.includes(pm.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedPayments([...selectedPayments, pm.id])
                                        else setSelectedPayments(selectedPayments.filter(id => id !== pm.id))
                                    }}
                                />
                                <Label htmlFor={pm.id} className="flex-1 cursor-pointer w-full">
                                    {pm.type === 'promptpay' ? (
                                        <div className="flex justify-between items-center w-full gap-4">
                                            <span className="font-black text-lg">PromptPay</span>
                                            <span className="text-muted-foreground font-medium tracking-wide text-right">{pm.promptpay_number}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center w-full gap-4">
                                            <span className="font-black text-lg">{pm.bank_name}</span>
                                            <div className="text-right">
                                                <span className="text-muted-foreground font-medium tracking-wide block">{pm.account_number}</span>
                                                <span className="text-muted-foreground/60 text-xs font-normal block">({pm.account_name})</span>
                                            </div>
                                        </div>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-center border-t border-border py-8">
                        <Button
                            className="w-full max-w-lg rounded-lg h-12 text-base font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-all group border-none"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <ChevronRight className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            {t('receipt.preview')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            {/* Shared Datalists */}
            <datalist id="product-list">
                {products.map((p) => (
                    <option key={p.id} value={p.name}>฿{p.price}</option>
                ))}
            </datalist>
        </div>
    )
}
