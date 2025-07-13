-- Storage Setup for Digital Business Card
-- Run this in Supabase SQL Editor after creating the bucket

-- Create storage bucket for business card images (run this in Storage section first)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('business-cards', 'business-cards', true);

-- Create storage policies
CREATE POLICY "Anyone can view business card images" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-cards');

CREATE POLICY "Users can upload business card images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'business-cards' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own business card images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'business-cards' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own business card images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'business-cards' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
