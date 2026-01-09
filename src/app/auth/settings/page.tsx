import React from 'react'
import { getProfile, getPaymentMethods } from './actions'
import SettingsForm from './settings-form'

export const metadata = {
  title: 'ตั้งค่าร้านค้า | Bitsync',
}

export default async function SettingsPage() {
  const profile = await getProfile()
  const paymentMethods = await getPaymentMethods()

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] w-full py-8 md:py-12">
      <div className="w-full max-w-5xl px-6">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm font-medium">
            จัดการข้อมูลส่วนตัว ร้านค้า และช่องทางการชำระเงินของคุณ
          </p>
        </div>

        <SettingsForm
          initialProfile={profile}
          initialPaymentMethods={paymentMethods}
        />
      </div>
    </div>
  )
}
