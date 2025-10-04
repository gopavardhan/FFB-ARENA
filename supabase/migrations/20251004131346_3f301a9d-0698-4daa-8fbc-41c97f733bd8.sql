-- Create storage bucket for deposit screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-screenshots', 'deposit-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for deposit screenshots
CREATE POLICY "Users can upload their own deposit screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deposit-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own deposit screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Boss can view all deposit screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-screenshots' AND
  public.has_role(auth.uid(), 'boss')
);

CREATE POLICY "Boss can delete deposit screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deposit-screenshots' AND
  public.has_role(auth.uid(), 'boss')
);