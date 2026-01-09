-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
-- Stores user and shop information linked to Clerk ID
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  full_name text,
  phone text,
  address text,
  shop_name text,
  shop_logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENT METHODS TABLE
-- Stores payment details. RLS ensures only the owner can access.
create table if not exists payment_methods (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  type text check (type in ('promptpay', 'bank_account')) not null,
  
  -- For PromptPay
  promptpay_type text check (promptpay_type in ('citizen_id', 'phone_number')),
  promptpay_number text, 
  
  -- For Bank Account
  bank_name text,
  account_name text,
  account_number text, 
  
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
-- Use this if you are using Supabase Auth tailored for Clerk, 
-- OTHERWISE (Simpler for now): We will control access via Server Actions (Service Role) 
-- but still enable RLS to perform default deny for public access.

alter table profiles enable row level security;
alter table payment_methods enable row level security;

-- Policy: Deny public access (default is deny, but being explicit is good)
create policy "No public access to profiles" on profiles for all using (false);
create policy "No public access to payment_methods" on payment_methods for all using (false);

-- Note: We will access these tables using the Supabase Service Role Key in our Server Actions,
-- which bypasses RLS. This keeps the data secure from public API requests.
