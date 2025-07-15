// OpenAI Vision API 연동

import OpenAI from 'openai';
import { BusinessCardData } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeBusinessCardWithOpenAI(
  imageUrl: string
): Promise<BusinessCardData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this business card image and extract structured information.
              Return a JSON object with the following structure:
              {
                "name": "person's name",
                "title": "job title",
                "company": "company name",
                "phone": "phone number",
                "email": "email address",
                "website": "website URL",
                "address": "physical address",
                "social": [{"platform": "platform name", "handle": "username"}]
              }

              Make sure all extracted data is accurate and properly formatted.
              Return only valid contact information that you can clearly see in the image.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.1, // 낮은 temperature로 일관성 있는 결과
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content) as BusinessCardData;
    
    // 결과 검증 및 정제
    return validateAndCleanBusinessCardData(result);
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    throw error;
  }
}

function validateAndCleanBusinessCardData(data: BusinessCardData): BusinessCardData {
  const cleaned: BusinessCardData = {};

  // 이름 정제
  if (data.name && typeof data.name === 'string') {
    cleaned.name = data.name.trim();
  }

  // 직책 정제
  if (data.title && typeof data.title === 'string') {
    cleaned.title = data.title.trim();
  }

  // 회사명 정제
  if (data.company && typeof data.company === 'string') {
    cleaned.company = data.company.trim();
  }

  // 전화번호 정제
  if (data.phone && typeof data.phone === 'string') {
    cleaned.phone = cleanPhoneNumber(data.phone);
  }

  // 이메일 정제
  if (data.email && typeof data.email === 'string') {
    const email = data.email.trim().toLowerCase();
    if (isValidEmail(email)) {
      cleaned.email = email;
    }
  }

  // 웹사이트 정제
  if (data.website && typeof data.website === 'string') {
    cleaned.website = cleanWebsiteUrl(data.website);
  }

  // 주소 정제
  if (data.address && typeof data.address === 'string') {
    cleaned.address = data.address.trim();
  }

  // 소셜 미디어 정제
  if (data.social && Array.isArray(data.social)) {
    cleaned.social = data.social
      .filter(item => item.platform && item.handle)
      .map(item => ({
        platform: item.platform.trim(),
        handle: item.handle.trim()
      }));
  }

  return cleaned;
}

function cleanPhoneNumber(phone: string): string {
  // 전화번호에서 숫자와 일부 특수문자만 유지
  return phone.replace(/[^\d\-\+\(\)\s]/g, '').trim();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function cleanWebsiteUrl(url: string): string {
  let cleaned = url.trim();
  
  // http:// 또는 https://가 없으면 추가
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  
  return cleaned;
}

// 이미지를 Base64로 변환하는 유틸리티 함수
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 이미지 URL을 업로드하고 분석하는 통합 함수
export async function analyzeBusinessCardImage(
  imageFile: File,
  uploadUrl: string
): Promise<BusinessCardData> {
  try {
    // 이미지를 업로드하고 공개 URL 획득
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }
    
    const { url: imageUrl } = await uploadResponse.json();
    
    // OpenAI Vision API로 분석
    return await analyzeBusinessCardWithOpenAI(imageUrl);
  } catch (error) {
    console.error('Business card analysis failed:', error);
    throw error;
  }
}
