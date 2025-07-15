-- Fix OCR data unique constraint for upsert operations
-- This migration adds a unique constraint on business_card_id to allow proper upsert operations

-- Add unique constraint to business_card_ocr_data table
ALTER TABLE public.business_card_ocr_data 
ADD CONSTRAINT unique_business_card_ocr_data_card_id 
UNIQUE (business_card_id);
