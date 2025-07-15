import jsQR from 'jsqr';
import sharp from 'sharp';

/**
 * 이미지에서 QR 코드를 감지하고 URL을 추출합니다.
 */
export async function detectQRCode(imageFile: File): Promise<string | null> {
  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(
      new Uint8ClampedArray(data),
      info.width,
      info.height
    );

    if (code && code.data) {
      if (isValidUrl(code.data)) {
        console.log('QR Code detected:', code.data);
        return code.data;
      } else {
        console.log('QR Code detected but not a URL:', code.data);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('QR code detection failed:', error);
    return null;
  }
}

/**
 * 문자열이 유효한 URL인지 확인합니다.
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 이미지 URL에서 QR 코드를 감지합니다.
 */
export async function detectQRCodeFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(
      new Uint8ClampedArray(data),
      info.width,
      info.height
    );

    if (code && code.data) {
      if (isValidUrl(code.data)) {
        console.log('QR Code detected from URL:', code.data);
        return code.data;
      } else {
        console.log('QR Code detected but not a URL:', code.data);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('QR code detection from URL failed:', error);
    return null;
  }
}
