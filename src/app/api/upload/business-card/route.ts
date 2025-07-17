import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const cardId = formData.get('cardId') as string;
    const side = formData.get('side') as string;

    if (!file || !cardId || !side) {
      return NextResponse.json(
        { error: 'File, card ID, and side are required' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${cardId}/${side}.${fileExtension}`;
    const filePath = `${session.user.email}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    const { data, error } = await supabaseAdmin.storage
      .from('business-cards')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('business-cards')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
