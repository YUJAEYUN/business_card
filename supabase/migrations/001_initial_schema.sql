-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_cards table
CREATE TABLE IF NOT EXISTS public.business_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT,
    card_type TEXT CHECK (card_type IN ('horizontal', 'vertical')) DEFAULT 'horizontal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_business_cards_updated_at
    BEFORE UPDATE ON public.business_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for business_cards
CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to business cards (for sharing)
CREATE POLICY "Anyone can view business cards" ON public.business_cards
    FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for business card images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-cards', 'business-cards', true)
ON CONFLICT (id) DO NOTHING;

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
