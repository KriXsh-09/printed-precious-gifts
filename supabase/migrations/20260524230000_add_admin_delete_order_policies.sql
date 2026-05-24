-- Allow admin to delete orders
create policy "admins delete any order" on public.orders for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');

-- Allow admin to delete custom_orders
create policy "admins delete any custom_order" on public.custom_orders for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
