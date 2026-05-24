-- RLS policies for admin to insert products
create policy "admins can insert products" on public.products for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');

-- RLS policies for admin to delete products
create policy "admins can delete products" on public.products for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
