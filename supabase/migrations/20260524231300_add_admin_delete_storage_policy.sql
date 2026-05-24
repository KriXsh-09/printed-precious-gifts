-- Allow admin to delete files from the custom-uploads bucket
create policy "admins delete any custom upload" on storage.objects for delete
  to authenticated
  using (bucket_id = 'custom-uploads' and auth.jwt() ->> 'email' = 'giftworldonlineofficial@gmail.com');
