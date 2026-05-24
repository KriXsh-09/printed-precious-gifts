-- Create orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone_number text not null,
  shipping_address text not null,
  pincode text not null,
  total_amount numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- RLS policies for orders
create policy "users select own orders" on public.orders for select using (auth.uid() = user_id);
create policy "users insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "users update own orders" on public.orders for update using (auth.uid() = user_id);

-- Link custom_orders to orders
alter table public.custom_orders add column order_id uuid references public.orders(id) on delete set null;
