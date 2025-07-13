import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

export async function uploadBusinessCardImage(
  file: File,
  userId: string,
  cardId: string,
  side: 'front' | 'back'
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${cardId}_${side}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from('business-cards')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('business-cards')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

export async function deleteBusinessCardImage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('business-cards')
      .remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Failed to delete image')
  }
}

export function getOptimizedImageUrl(
  originalUrl: string,
  _width?: number,
  _height?: number,
  _quality?: number
): string {
  // For now, return the original URL
  // TODO: Implement image optimization using Supabase Transform or external service
  return originalUrl
}

export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
