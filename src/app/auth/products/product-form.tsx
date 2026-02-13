'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2, Package, Upload, Image as ImageIcon, DollarSign, ListOrdered, Edit, AlertTriangle } from 'lucide-react'
import { toast } from "sonner"
import useSWR, { mutate } from 'swr'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useLanguage } from '@/components/language-provider'

type Product = {
    id?: string
    name: string
    price: number
    quantity: number
    image_url: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProductManagement() {
    const { t } = useLanguage()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { data: productsData, error, isLoading: isSWRLoading } = useSWR<Product[]>('/api/products', fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    const products = productsData || []
    const isInitialLoading = isSWRLoading && products.length === 0
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: 0,
        quantity: 0,
        image_url: ''
    })

    const itemsPerPage = 12
    const [currentPage, setCurrentPage] = useState(1)

    // --- API Helpers ---

    const handleFileUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 3MB limit as requested
        if (file.size > 3 * 1024 * 1024) {
            toast.error(t('products.error_size'))
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

                if (!res.ok) throw new Error(t('products.upload_failed'))
                const data = await res.json()
                setNewProduct(prev => ({ ...prev, image_url: data.url }))
                toast.success(t('products.upload_success'))
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error(t('products.upload_failed'))
        } finally {
            setIsUploading(false)
        }
    }, [])

    const handleSaveProduct = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProduct.name || newProduct.price < 0) {
            toast.error(t('common.error_fill'))
            return
        }

        startTransition(async () => {
            try {
                const url = editingId ? `/api/products?id=${editingId}` : '/api/products'
                const method = editingId ? 'PUT' : 'POST'

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                })

                if (!res.ok) {
                    let errorMessage = t('products.save_error')
                    try {
                        const errorData = await res.json()
                        errorMessage = errorData.error || errorMessage
                    } catch (e) {
                        errorMessage = `Error ${res.status}`
                    }
                    throw new Error(errorMessage)
                }

                toast.success(editingId ? t('products.update_success') : t('products.save_success'))
                setIsDialogOpen(false)
                setNewProduct({ name: '', price: 0, quantity: 0, image_url: '' })
                setEditingId(null)
                mutate('/api/products')
            } catch (err: any) {
                console.error('Product Save Error Detail:', err)
                toast.error(err.message || t('common.error_unknown'))
            }
        })
    }, [newProduct, editingId])

    const handleEditClick = (product: Product) => {
        setNewProduct({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image_url: product.image_url
        })
        setEditingId(product.id!)
        setIsDialogOpen(true)
    }

    const confirmDelete = React.useCallback(async () => {
        if (!deleteId) return

        startTransition(async () => {
            try {
                const res = await fetch(`/api/products?id=${deleteId}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error(t('products.delete_error'))

                mutate('/api/products')
                toast.success(t('products.delete_success'))
                setDeleteId(null)
            } catch (err) {
                console.error(err)
                toast.error(t('products.delete_error'))
            }
        })
    }, [deleteId])

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(products.length / itemsPerPage)

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tight text-foreground uppercase">
                        {t('products.title').split(' ')[0]} <span className="text-primary italic">{t('products.title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-0.5 text-[11px] uppercase tracking-wider">{t('products.subtitle')}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                        setNewProduct({ name: '', price: 0, quantity: 0, image_url: '' })
                        setEditingId(null)
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-lg h-10 px-6 shadow-sm bg-primary text-primary-foreground font-bold transition-all">
                            <Plus className="mr-2 h-5 w-5" /> {t('products.add')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-xl border border-border bg-card p-6">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight">{editingId ? t('products.edit') : t('products.add')}</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">{editingId ? t('products.edit_desc') : t('products.add_desc')}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveProduct} className="space-y-6 py-4">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="font-semibold text-muted-foreground ml-1">{t('products.name')}</Label>
                                    <Input
                                        id="name"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder={t('products.name_placeholder')}
                                        className="rounded-lg h-10 border-border"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="price" className="font-semibold text-muted-foreground ml-1 text-sm">{t('products.price')}</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors">฿</div>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={newProduct.price || ''}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    setNewProduct({ ...newProduct, price: isNaN(val) ? 0 : val });
                                                }}
                                                className="pl-8 rounded-lg h-10 border-border"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity" className="font-semibold text-muted-foreground ml-1 text-sm">{t('products.stock')}</Label>
                                        <div className="relative group">
                                            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={newProduct.quantity || ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setNewProduct({ ...newProduct, quantity: isNaN(val) ? 0 : val });
                                                }}
                                                className="pl-9 rounded-lg h-10 border-border font-mono"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-semibold text-muted-foreground ml-1 text-sm">{t('products.image')} ({t('products.upload_desc')})</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group overflow-hidden bg-muted/20 border border-dashed border-border rounded-xl w-32 h-32 flex items-center justify-center transition-all hover:border-primary/40 hover:bg-muted/40">
                                            {newProduct.image_url ? (
                                                <img
                                                    src={newProduct.image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-4 drop-shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center text-muted-foreground/30">
                                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.upload')}</span>
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="relative w-full rounded-lg h-10 border-border font-semibold transition-all"
                                                disabled={isUploading}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {t('common.select_file')}
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
                                                    className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 w-full rounded-xl transition-all font-bold"
                                                    onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                                                >
                                                    {t('common.remove')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full rounded-lg h-12 text-base font-bold bg-primary text-primary-foreground shadow-sm" disabled={isPending || isUploading}>
                                    {isPending && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isInitialLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="animate-pulse rounded-xl aspect-4/5 bg-muted/30 border-border" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/5">
                    <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-bold text-muted-foreground">{t('common.no_data')}</h3>
                    <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">{t('products.add_first_desc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {currentProducts.map(product => (
                        <Card key={product.id} className="group relative overflow-hidden rounded-lg border border-border/40 shadow-none hover:border-primary/40 transition-all duration-300 bg-card">
                            <div className="aspect-4/3 w-full relative overflow-hidden bg-muted/5 border-b border-border/40">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/5">
                                        <Package className="h-8 w-8" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-1.5 left-1.5">
                                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm border ${product.quantity > 0 ? 'bg-background/95 text-foreground/80 border-border/40 backdrop-blur-md shadow-sm' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                        {product.quantity > 0 ? `${t('products.stock')}: ${product.quantity}` : t('products.out_of_stock')}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-3 space-y-1.5">
                                <div>
                                    <h3 className="font-bold text-[13px] leading-tight text-foreground truncate" title={product.name}>{product.name}</h3>
                                    <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">ID: {product.id?.substring(0, 8).toUpperCase()}</p>
                                </div>

                                <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
                                    <p className="text-base font-black text-primary font-mono tracking-tighter">
                                        ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>

                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary"
                                            onClick={() => handleEditClick(product)}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setDeleteId(product.id!)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isInitialLoading && products.length > 0 && (
                <Pagination className="py-6">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => handlePageChange(page)}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" /> {t('products.delete_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('products.delete_desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg border-border font-semibold">{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg font-bold"
                        >
                            {t('common.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}
