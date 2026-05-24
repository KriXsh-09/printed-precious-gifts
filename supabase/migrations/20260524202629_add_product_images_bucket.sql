-- create product-images bucket
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

-- storage policies for public access (select)
create policy "public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

-- storage policies for admin upload (insert/update/delete)
create policy "authenticated manage product images" on storage.objects for insert
  to authenticated with check (bucket_id = 'product-images');
create policy "authenticated update product images" on storage.objects for update
  to authenticated using (bucket_id = 'product-images');
create policy "authenticated delete product images" on storage.objects for delete
  to authenticated using (bucket_id = 'product-images');
