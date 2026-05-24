-- Allow admin to read/select all reference images in the custom-uploads bucket
create policy "admins read all custom uploads" on storage.objects for select
  to authenticated
  using (bucket_id = 'custom-uploads' and auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
