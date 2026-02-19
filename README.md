<p align="center">
  <img src="https://raw.githubusercontent.com/Faris4166/Simple-Checklist-Application-in-Python/refs/heads/main/BG.jpg" width="600" />
</p>
# BitsSync

BitsSync เป็นแอปพลิเคชันจัดการร้านค้าที่ทรงพลัง สร้างด้วย Next.js, Supabase, และ AI (Gemini) เพื่อช่วยให้การจัดการสต็อกสินค้า การออกใบเสร็จ และการวิเคราะห์ข้อมูลเป็นเรื่องง่ายและรวดเร็ว

## ✨ คุณสมบัติเด่น (Features)

- 📊 **Dashboard อัจฉริยะ**: ติดตามยอดขายและสถิติต่างๆ แบบ Real-time พร้อมกราฟวิเคราะห์ข้อมูล
- 📝 **จัดการสินค้า (Inventory)**: ระบบเพิ่ม/แก้ไข/ลบ สินค้า พร้อมการจัดการสต็อกที่ครบถ้วน
- 🧾 **ออกใบเสร็จ (Receipts)**: สร้างใบเสร็จรับเงินอย่างมืออาชีพ รองรับการจ่ายเงินผ่าน PromptPay QR Code
- 🤖 **AI Insights**: ใช้ Gemini AI ในการวิเคราะห์ข้อมูลการขายและให้คำแนะนำเพื่อเพิ่มยอดขาย
- 🔒 **ระบบสมาชิก**: ปลอดภัยด้วยการยืนยันตัวตนผ่าน Clerk Auth

---

## 🚀 ขั้นตอนการติดตั้ง (Installation)

### 1. เตรียมความพร้อม (Prerequisites)

ก่อนเริ่มใช้งาน คุณต้องมีสิ่งต่อไปนี้:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 20 ขึ้นไป)
- บัญชี [Clerk](https://clerk.dev/) สำหรับจัดการระบบสมาชิก
- บัญชี [Supabase](https://supabase.com/) สำหรับฐานข้อมูล
- [Gemini API Key](https://aistudio.google.com/) สำหรับฟีเจอร์ AI

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. การตั้งค่า Environment Variables

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

### 4. การตั้งค่าฐานข้อมูล (Database Setup)

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. สร้าง Project ใหม่
3. เข้าไปที่เมนู **SQL Editor**
4. คัดลอกเนื้อหาจากไฟล์ `master_schema.sql` ในโปรเจกต์นี้
5. วางลงใน SQL Editor แล้วกด **Run**
   - _ขั้นตอนนี้จะสร้างตาราง `profiles`, `products`, `receipts`, `payment_methods` และอื่นๆ พร้อมตั้งค่า RLS_

---

## 🛠️ วิธีใช้งานเบื้องต้น (Usage Guide)

### การรันโปรเจกต์ในเครื่อง (Local Development)

```bash
npm run dev
```

แล้วเข้าไปที่ [http://localhost:3000](http://localhost:3000)

### ขั้นตอนสำคัญหลังรันโปรเจกต์:

1. **ลงทะเบียน**: สมัครสมาชิกผ่านระบบ Clerk
2. **ตั้งค่าโปรไฟล์**: ไปที่เมนูตั้งค่าเพื่อใส่ข้อมูลร้านค้าและเลข PromptPay
3. **เพิ่มสินค้า**: ไปที่จัดการสินค้าเพื่อใส่ข้อมูลสินค้าในสต็อก
4. **ออกใบเสร็จ**: เมื่อมีการขาย ให้กดสร้างใบเสร็จ ระบบจะคำนวณยอดเงินรวมและแสดง QR Code ให้ลูกค้าจ่ายเงินได้ทันที

---

## 🏗️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: Next.js (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **AI Integration**: Google Gemini API
- **UI Components**: Shadcn/UI & Radix UI

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เป็นลิขสิทธิ์ส่วนบุคคล โปรดตรวจสอบเงื่อนไขการใช้งานก่อนนำไปเผยแพร่
