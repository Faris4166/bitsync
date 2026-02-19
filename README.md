# BitsSync - ระบบจัดการร้านค้าอัจฉริยะ (Smart Shop Management System)

[Thai](#ภาษาไทย) | [English](#english)

---

<a name="ภาษาไทย"></a>

## 🇹🇭 ภาษาไทย

BitsSync เป็นแอปพลิเคชันจัดการร้านค้าที่ทรงพลัง สร้างด้วย Next.js, Supabase, และ AI (Gemini) เพื่อช่วยให้การจัดการสต็อกสินค้า การออกใบเสร็จ และการวิเคราะห์ข้อมูลเป็นเรื่องง่ายและรวดเร็ว

### ✨ คุณสมบัติเด่น (Features)

- 📊 **Dashboard อัจฉริยะ**: ติดตามยอดขายและสถิติต่างๆ แบบ Real-time พร้อมกราฟวิเคราะห์ข้อมูล
- 📝 **จัดการสินค้า (Inventory)**: ระบบเพิ่ม/แก้ไข/ลบ สินค้า พร้อมการจัดการสต็อกที่ครบถ้วน
- 🧾 **ออกใบเสร็จ (Receipts)**: สร้างใบเสร็จรับเงินอย่างมืออาชีพ รองรับการจ่ายเงินผ่าน PromptPay QR Code
- 🤖 **AI Insights**: ใช้ Gemini AI ในการวิเคราะห์ข้อมูลการขายและให้คำแนะนำเพื่อเพิ่มยอดขาย
- 🔒 **ระบบสมาชิก**: ปลอดภัยด้วยการยืนยันตัวตนผ่าน Clerk Auth

### 🚀 ขั้นตอนการติดตั้ง (Installation)

#### 1. เตรียมความพร้อม (Prerequisites)

ก่อนเริ่มใช้งาน คุณต้องมีสิ่งต่อไปนี้:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 20 ขึ้นไป)
- บัญชี [Clerk](https://clerk.dev/) สำหรับจัดการระบบสมาชิก
- บัญชี [Supabase](https://supabase.com/) สำหรับฐานข้อมูล
- [Gemini API Key](https://aistudio.google.com/) สำหรับฟีเจอร์ AI

#### 2. ติดตั้ง Dependencies

```bash
npm install
```

#### 3. การตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ที่ root directory และเพิ่มค่าต่างๆ ดังนี้:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

#### 4. การตั้งค่าฐานข้อมูล (Database Setup)

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. สร้าง Project ใหม่
3. เข้าไปที่เมนู **SQL Editor**
4. คัดลอกเนื้อหาจากไฟล์ `master_schema.sql` ในโปรเจกต์นี้
5. วางลงใน SQL Editor แล้วกด **Run**

### 🛠️ วิธีใช้งานเบื้องต้น (Usage Guide)

```bash
npm run dev
```

1. **ลงทะเบียน**: สมัครสมาชิกผ่านระบบ Clerk
2. **ตั้งค่าโปรไฟล์**: ใส่ข้อมูลร้านค้าและเลข PromptPay
3. **จัดการสินค้า**: เพิ่มข้อมูลสินค้าในสต็อก
4. **ออกใบเสร็จ**: สร้างใบเสร็จพร้อม QR Code สำหรับชำระเงิน

---

<a name="english"></a>

## 🇺🇸 English

BitsSync is a powerful shop management application built with Next.js, Supabase, and AI (Gemini) to streamline inventory management, receipt generation, and data analysis.

### ✨ Key Features

- 📊 **Smart Dashboard**: Real-time sales tracking and analytics with interactive charts.
- 📝 **Inventory Management**: Complete CRUD system for products and stock handling.
- 🧾 **Professional Receipts**: Generate professional receipts with integrated PromptPay QR codes.
- 🤖 **AI Insights**: Leverages Gemini AI to analyze sales data and provide growth recommendations.
- 🔒 **Secure Auth**: Authentication and user management powered by Clerk.

### 🚀 Installation Guide

#### 1. Prerequisites

Ensure you have the following ready:

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [Clerk](https://clerk.dev/) account for authentication
- [Supabase](https://supabase.com/) account for database
- [Gemini API Key](https://aistudio.google.com/) for AI features

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

#### 4. Database Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project.
3. Open **SQL Editor**.
4. Copy the content from `master_schema.sql` in this repo.
5. Paste it into the SQL Editor and click **Run**.

### 🛠️ Basic Usage

```bash
npm run dev
```

1. **Sign Up**: Register using the Clerk authentication system.
2. **Profile Setup**: Configure shop details and PromptPay number.
3. **Inventory**: Add your products to the stock list.
4. **Receipts**: Create receipts with auto-generated payment QR codes.

---

## 🏗️ Tech Stack

- **Framework**: Next.js (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **AI Integration**: Google Gemini API
- **UI Components**: Shadcn/UI & Radix UI
