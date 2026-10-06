-- Interior Design E-Commerce MVP
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  specification text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key,
  order_no text unique not null,
  full_name text not null,
  phone text not null,
  email text not null,
  delivery_address text not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  status text not null default 'awaiting_payment_verification'
    check (status in (
      'awaiting_payment_verification',
      'payment_verified',
      'processing',
      'completed',
      'cancelled'
    )),
  payment_proof_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

-- Public may browse products.
create policy "Public can read products"
on public.products for select
to anon, authenticated
using (true);

-- Only authorized admins can modify products.
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

create policy "Admins can update products"
on public.products for update
to authenticated
using (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

create policy "Admins can delete products"
on public.products for delete
to authenticated
using (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

-- Anyone may submit an order, but only admins may read/update orders.
create policy "Public can submit orders"
on public.orders for insert
to anon, authenticated
with check (true);

create policy "Admins can read orders"
on public.orders for select
to authenticated
using (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

create policy "Admins can update orders"
on public.orders for update
to authenticated
using (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

create policy "Public can submit order items"
on public.order_items for insert
to anon, authenticated
with check (true);

create policy "Admins can read order items"
on public.order_items for select
to authenticated
using (exists (
  select 1 from public.admin_users a where a.user_id = auth.uid()
));

-- Admin list is readable only to the logged-in user for their own row.
create policy "Users can verify own admin membership"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- Storage buckets.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = excluded.public;

-- Product images: public read, admin write.
create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- Customers may upload payment proof; only admins can read it.
create policy "Customers can upload payment proofs"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'payment-proofs');

create policy "Admins can view payment proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- Sample products.
insert into public.products (name, description, specification, price, category, image_url, featured)
values
('Sora Lounge Chair', 'A sculptural lounge chair with a warm oak frame and soft neutral upholstery.', 'Oak frame · Linen blend · 78 × 82 × 74 cm', 420.00, 'Seating', '/products/lounge-chair.svg', true),
('Luma Pendant Light', 'A soft-glow pendant designed for dining rooms, islands and calm reading corners.', 'Powder-coated metal · 32 cm diameter · E27 fitting', 168.00, 'Lighting', '/products/pendant.svg', true),
('Mori Side Table', 'Compact side table with rounded edges and a natural ash finish.', 'Solid ash · 48 × 42 × 52 cm', 245.00, 'Tables', '/products/side-table.svg', true),
('Kinu Floor Lamp', 'Minimal floor lamp that creates a warm ambient wash for living spaces.', 'Steel base · Fabric shade · 155 cm height', 289.00, 'Lighting', '/products/floor-lamp.svg', false),
('Nami Ceramic Vase', 'Hand-finished ceramic vase with a quiet matte texture for shelves and consoles.', 'Ceramic · 24 cm height', 72.00, 'Decor', '/products/vase.svg', false),
('Aki Low Cabinet', 'Low-profile storage cabinet with sliding doors for clean, modern interiors.', 'Ash veneer · 140 × 42 × 58 cm', 690.00, 'Storage', '/products/cabinet.svg', false);
