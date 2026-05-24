
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles selectable by owner" on public.profiles for select using (auth.uid() = id);
create policy "profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles updatable by owner" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price_4inch numeric(10,2) not null default 0,
  price_6inch numeric(10,2) not null default 0,
  price_8inch numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products are public" on public.products for select using (true);

-- custom orders
create table public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  size text not null check (size in ('4inch','6inch','8inch')),
  quantity int not null check (quantity > 0),
  reference_image_path text,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.custom_orders enable row level security;
create policy "custom_orders select own" on public.custom_orders for select using (auth.uid() = user_id);
create policy "custom_orders insert own" on public.custom_orders for insert with check (auth.uid() = user_id);
create policy "custom_orders update own" on public.custom_orders for update using (auth.uid() = user_id);
create policy "custom_orders delete own" on public.custom_orders for delete using (auth.uid() = user_id);

-- storage bucket for user-uploaded reference images
insert into storage.buckets (id, name, public) values ('custom-uploads', 'custom-uploads', false);

create policy "users upload own folder" on storage.objects for insert
  to authenticated with check (bucket_id = 'custom-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users read own files" on storage.objects for select
  to authenticated using (bucket_id = 'custom-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- seed sample products
insert into public.products (name, description, image_url, price_4inch, price_6inch, price_8inch) values
('Heroic Knight', 'A gallant knight in detailed armor, perfect as a centerpiece gift.', null, 3500, 6500, 8500),
('Whimsical Fox', 'Playful fox figurine with stylized features and a charming pose.', null, 4500, 6500, 8500),
('Tiny Astronaut', 'An adorable astronaut floating mid-step, ideal for dreamers.', null, 5000, 6500, 9000),
('Garden Fairy', 'Delicate fairy with lace-like wings perched on a flower.', null, 5500, 6500, 8500),
('Mini Dragon', 'Coiled mini dragon with intricate scale detail.', null, 5500, 6500, 8500),
('Custom Bust', 'Personalized bust of someone special — upload a photo to begin.', null, 7000, 8000, 9500);
