import React from 'react'
import ProductManagement from './product-form'

export const metadata = {
  title: 'จัดการสินค้า | Bitsync',
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] w-full py-8 md:py-12">
      <div className="w-full px-6">
        <ProductManagement />
      </div>
    </div>
  )
}
