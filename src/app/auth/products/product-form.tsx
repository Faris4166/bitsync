'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2, Package, Upload, Image as ImageIcon, DollarSign, ListOrdered } from 'lucide-react'
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Product = {
    id?: string
    name: string
    price: number
    quantity: number
    image_url: string
}

export default function ProductManagement() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [products, setProducts] = useState<Product[]>([])
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: 0,
        quantity: 0,
        image_url: ''
    })

    // --- API Helpers ---

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setIsInitialLoading(false)
        }
    }

    React.useEffect(() => {
        fetchProducts()
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 3MB limit as requested
        if (file.size > 3 * 1024 * 1024) {
            toast.error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 3MB)')
            return
        }

        setIsUploading(true)
        try {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = async () => {
                const base64Content = reader.result?.toString().split(',')[1]
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
                setNewProduct(prev => ({ ...prev, image_url: data.url }))
                toast.success('อัปโหลดรูปภาพเรียบร้อย')
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('เกิดข้อผิดพลาดในการอัปโหลด')
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProduct.name || newProduct.price < 0) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        startTransition(async () => {
            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                })

                if (!res.ok) {
                    let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกสินค้า'
                    try {
                        const errorData = await res.json()
                        errorMessage = errorData.error || errorMessage
                    } catch (e) {
                        errorMessage = `Error ${res.status}: ไม่สามารถบันทึกได้ (อาจยังไม่ได้รัน SQL หรือตั้งค่า Key ไม่ถูกต้อง)`
                    }
                    throw new Error(errorMessage)
                }

                toast.success('บันทึกสินค้าเรียบร้อยแล้ว')
                setIsDialogOpen(false)
                setNewProduct({ name: '', price: 0, quantity: 0, image_url: '' })
                await fetchProducts()
            } catch (err: any) {
                console.error('Product Save Error Detail:', err)
                toast.error(err.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก')
            }
        })
    }

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('ยืนยันการลบสินค้านี้?')) return

        startTransition(async () => {
            try {
                const res = await fetch(`/api/products?id=${id}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Failed to delete')

                setProducts(prev => prev.filter(p => p.id !== id))
                toast.success('ลบสินค้าเรียบร้อย')
            } catch (err) {
                console.error(err)
                toast.error('เกิดข้อผิดพลาดในการลบ')
            }
        })
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">จัดการรายการสินค้าในคลังของคุณ</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6 shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มสินค้าใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle>เพิ่มสินค้า</DialogTitle>
                            <DialogDescription>กรอกข้อมูลรายละเอียดสินค้าและอัปโหลดรูปภาพ</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddProduct} className="space-y-6 py-4">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">ชื่อสินค้า</Label>
                                    <Input
                                        id="name"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="เช่น เสื้อยืดลายกราฟิก"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">ราคา (บาท)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="price"
                                                type="number"
                                                value={newProduct.price || ''}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    setNewProduct({ ...newProduct, price: isNaN(val) ? 0 : val });
                                                }}
                                                className="pl-9 rounded-xl"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">จำนวนคงเหลือ</Label>
                                        <div className="relative">
                                            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={newProduct.quantity || ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setNewProduct({ ...newProduct, quantity: isNaN(val) ? 0 : val });
                                                }}
                                                className="pl-9 rounded-xl"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>รูปภาพสินค้า (สูงสุด 3MB)</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group overflow-hidden bg-muted/20 border-2 border-dashed rounded-2xl w-32 h-32 flex items-center justify-center transition-all hover:bg-muted/30">
                                            {newProduct.image_url ? (
                                                <img
                                                    src={newProduct.image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="relative w-full rounded-xl border-dashed"
                                                disabled={isUploading}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                เลือกไฟล์ภาพ
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                            </Button>
                                            {newProduct.image_url && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive w-full"
                                                    onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                                                >
                                                    ลบรูปภาพ
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full rounded-xl" disabled={isPending || isUploading}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    เพิ่มลงในคลัง
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isInitialLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse rounded-[2rem] h-64 bg-muted/20 border-none" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/5">
                    <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
                    <h3 className="text-xl font-bold text-muted-foreground">ไม่มีสินค้าในคลัง</h3>
                    <p className="text-muted-foreground/60 max-w-xs mx-auto">เริ่มต้นด้วยการเพิ่มสินค้าชิ้นแรกของคุณเพื่อนำไปออกใบเสร็จ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <Card key={product.id} className="group relative overflow-hidden rounded-[2rem] border-none bg-card shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="aspect-square w-full relative overflow-hidden bg-muted/10">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Package className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-full shadow-lg"
                                        onClick={() => handleDeleteProduct(product.id!)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <div className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-bold border border-border/50">
                                        Stock: {product.quantity}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-black text-primary">
                                        ฿{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
