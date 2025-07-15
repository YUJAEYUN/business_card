-- Phase 2a Features Migration
-- FR7: 클릭 가능한 영역 설정 및 데이터 연결
-- FR8: 사용자 정의 단축 URL
-- FR9: 디지털 명함 지갑 자동 저장
-- FR10: 명함 이미지 업데이트 기능

-- 1. 명함 OCR 데이터 테이블
CREATE TABLE IF NOT EXISTS public.business_card_ocr_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    extracted_text TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    language_detected VARCHAR(10),
    extraction_method VARCHAR(20) DEFAULT 'tesseract', -- 'tesseract', 'openai', 'manual'
    raw_data JSONB, -- 원본 OCR 결과 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 클릭 가능한 영역 (Interactive Zones) 테이블
CREATE TABLE IF NOT EXISTS public.interactive_zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    zone_type VARCHAR(50) NOT NULL, -- 'phone', 'email', 'website', 'address', 'social', 'custom'
    zone_data JSONB NOT NULL, -- 연락처 정보 등
    coordinates JSONB NOT NULL, -- {x, y, width, height, side: 'front'|'back'}
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 정의 단축 URL 테이블
CREATE TABLE IF NOT EXISTS public.custom_slugs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 슬러그 제약조건: 영문, 숫자, 하이픈, 언더스코어만 허용
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9._-]+$'),
    CONSTRAINT slug_length CHECK (LENGTH(slug) >= 3 AND LENGTH(slug) <= 100)
);

-- 4. 명함 지갑 (저장된 명함) 테이블
CREATE TABLE IF NOT EXISTS public.business_card_wallet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    nickname VARCHAR(255), -- 사용자가 설정한 닉네임
    tags TEXT[], -- 분류용 태그
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT, -- 개인 메모
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 저장 방지
    UNIQUE(user_id, business_card_id)
);

-- 5. 명함 조회수 및 분석 테이블
CREATE TABLE IF NOT EXISTS public.business_card_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'zone_click', 'qr_scan', 'url_share'
    event_data JSONB, -- 추가 이벤트 데이터
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2), -- ISO 국가 코드
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 명함 버전 관리 테이블 (FR10: 이미지 업데이트)
CREATE TABLE IF NOT EXISTS public.business_card_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT,
    card_type VARCHAR(20) DEFAULT 'horizontal',
    change_description TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 버전 번호는 명함별로 유니크
    UNIQUE(business_card_id, version_number)
);

-- 기존 business_cards 테이블에 컬럼 추가
ALTER TABLE public.business_cards 
ADD COLUMN IF NOT EXISTS custom_slug VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_business_card_ocr_data_card_id ON public.business_card_ocr_data(business_card_id);
CREATE INDEX IF NOT EXISTS idx_interactive_zones_card_id ON public.interactive_zones(business_card_id);
CREATE INDEX IF NOT EXISTS idx_interactive_zones_type ON public.interactive_zones(zone_type);
CREATE INDEX IF NOT EXISTS idx_custom_slugs_slug ON public.custom_slugs(slug);
CREATE INDEX IF NOT EXISTS idx_custom_slugs_card_id ON public.custom_slugs(business_card_id);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.business_card_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_card_id ON public.business_card_wallet(business_card_id);
CREATE INDEX IF NOT EXISTS idx_wallet_favorite ON public.business_card_wallet(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_analytics_card_id ON public.business_card_analytics(business_card_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.business_card_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.business_card_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_versions_card_id ON public.business_card_versions(business_card_id);
CREATE INDEX IF NOT EXISTS idx_versions_current ON public.business_card_versions(business_card_id, is_current);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.business_card_ocr_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_card_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_card_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_card_versions ENABLE ROW LEVEL SECURITY;

-- OCR 데이터 정책
CREATE POLICY "Users can view OCR data of their own cards" ON public.business_card_ocr_data
    FOR SELECT USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert OCR data for their own cards" ON public.business_card_ocr_data
    FOR INSERT WITH CHECK (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update OCR data of their own cards" ON public.business_card_ocr_data
    FOR UPDATE USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

-- 인터랙티브 존 정책
CREATE POLICY "Users can manage interactive zones of their own cards" ON public.interactive_zones
    FOR ALL USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view active interactive zones" ON public.interactive_zones
    FOR SELECT USING (is_active = true);

-- 커스텀 슬러그 정책
CREATE POLICY "Users can manage custom slugs of their own cards" ON public.custom_slugs
    FOR ALL USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view active custom slugs" ON public.custom_slugs
    FOR SELECT USING (is_active = true);

-- 명함 지갑 정책
CREATE POLICY "Users can manage their own wallet" ON public.business_card_wallet
    FOR ALL USING (user_id = auth.uid());

-- 분석 데이터 정책
CREATE POLICY "Users can view analytics of their own cards" ON public.business_card_analytics
    FOR SELECT USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert analytics data" ON public.business_card_analytics
    FOR INSERT WITH CHECK (true);

-- 버전 관리 정책
CREATE POLICY "Users can manage versions of their own cards" ON public.business_card_versions
    FOR ALL USING (
        business_card_id IN (
            SELECT id FROM public.business_cards WHERE user_id = auth.uid()
        )
    );

-- 트리거 함수들
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_business_card_ocr_data_updated_at BEFORE UPDATE ON public.business_card_ocr_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactive_zones_updated_at BEFORE UPDATE ON public.interactive_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_slugs_updated_at BEFORE UPDATE ON public.custom_slugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_card_wallet_updated_at BEFORE UPDATE ON public.business_card_wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 명함 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_card_view_count(card_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.business_cards 
    SET view_count = view_count + 1 
    WHERE id = card_id;
    
    INSERT INTO public.business_card_analytics (business_card_id, event_type)
    VALUES (card_id, 'view');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 명함 버전 관리 함수
CREATE OR REPLACE FUNCTION create_new_card_version(
    card_id UUID,
    new_front_image_url TEXT,
    new_back_image_url TEXT DEFAULT NULL,
    new_card_type VARCHAR(20) DEFAULT 'horizontal',
    change_desc TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_version_number INTEGER;
    version_id UUID;
BEGIN
    -- 현재 최대 버전 번호 조회
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO new_version_number
    FROM public.business_card_versions 
    WHERE business_card_id = card_id;
    
    -- 기존 current 버전을 false로 변경
    UPDATE public.business_card_versions 
    SET is_current = false 
    WHERE business_card_id = card_id AND is_current = true;
    
    -- 새 버전 생성
    INSERT INTO public.business_card_versions (
        business_card_id, version_number, front_image_url, back_image_url, 
        card_type, change_description, is_current
    ) VALUES (
        card_id, new_version_number, new_front_image_url, new_back_image_url,
        new_card_type, change_desc, true
    ) RETURNING id INTO version_id;
    
    -- 메인 테이블 업데이트
    UPDATE public.business_cards 
    SET 
        front_image_url = new_front_image_url,
        back_image_url = new_back_image_url,
        card_type = new_card_type,
        version_number = new_version_number,
        updated_at = NOW()
    WHERE id = card_id;
    
    RETURN version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 명함 지갑에 자동 저장 함수
CREATE OR REPLACE FUNCTION auto_save_to_wallet(
    viewer_user_id UUID,
    card_id UUID
)
RETURNS void AS $$
BEGIN
    -- 이미 저장되어 있지 않고, 자신의 명함이 아닌 경우에만 저장
    INSERT INTO public.business_card_wallet (user_id, business_card_id)
    SELECT viewer_user_id, card_id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.business_card_wallet 
        WHERE user_id = viewer_user_id AND business_card_id = card_id
    )
    AND card_id NOT IN (
        SELECT id FROM public.business_cards WHERE user_id = viewer_user_id
    )
    ON CONFLICT (user_id, business_card_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
