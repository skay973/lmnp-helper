INSERT INTO storage.buckets (id, name, public)
VALUES ('edl-photos', 'edl-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'edl-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'edl-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'edl-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
