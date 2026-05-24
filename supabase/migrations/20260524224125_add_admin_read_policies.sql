-- Allow admin to select all orders
create policy "admins select all orders" on public.orders for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');

-- Allow admin to select all custom_orders (to display ordered items in admin panel)
create policy "admins select all custom_orders" on public.custom_orders for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
