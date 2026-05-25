-- Allow admin to update order status
create policy "admins update any order" on public.orders for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com')
  with check (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
