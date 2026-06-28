-- PGR UAE safe customer account schema (no wallet / investment balance tables)

create table if not exists customers (
  id uuid primary key,
  auth_user_id uuid,
  full_name text not null,
  email text unique not null,
  phone text,
  country text,
  city text,
  preferred_language text default 'en',
  company_name text,
  delivery_destination text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists quote_requests (
  id text primary key,
  customer_id uuid references customers(id),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  product_id text,
  product_name text,
  quantity numeric default 1,
  metal_interest text,
  weight_preference text,
  message text,
  status text default 'awaiting_confirmation',
  confirmed_price numeric,
  currency text default 'USD',
  admin_notes text,
  quote_expiry timestamptz,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  customer_id text,
  quote_id text references quote_requests(id),
  product_id text,
  product_name text,
  quantity numeric default 1,
  status text default 'awaiting_confirmation',
  confirmed_price numeric,
  currency text default 'USD',
  payment_status text default 'unpaid',
  payment_link text,
  bank_transfer_details text,
  payment_receipt_url text,
  delivery_status text,
  invoice_url text,
  certificate_url text,
  admin_notes text,
  quote_expiry timestamptz,
  shipping_method text,
  shipping_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
