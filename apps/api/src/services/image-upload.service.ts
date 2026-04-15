/**
 * Image Upload Utility
 * Uploads generated images to Supabase Storage (FREE)
 * Converts base64 → Supabase public URL for lightweight API responses
 */

import { supabaseAdmin } from '@k2w/database';

const BUCKET_NAME = 'k2w-images';

/**
 * Generate a unique filename
 */
function uniqueFileName(extension: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `hero-${ts}-${rand}.${extension}`;
}

/**
 * Ensure the storage bucket exists (idempotent)
 */
async function ensureBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
      if (error) {
        console.warn('[ImageUpload] Bucket creation warning:', error.message);
      } else {
        console.log('[ImageUpload] ✅ Created public bucket:', BUCKET_NAME);
      }
    }
  } catch (err) {
    console.warn('[ImageUpload] Bucket check failed (may already exist):', err);
  }
}

/**
 * Upload a base64 image to Supabase Storage
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(base64DataUrl: string): Promise<string> {
  await ensureBucket();

  // Parse base64 data URL: "data:image/png;base64,XXXX"
  const matches = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    // Already a URL, return as-is
    if (base64DataUrl.startsWith('http')) return base64DataUrl;
    throw new Error('Invalid image format: expected data:image/...;base64,... or http URL');
  }

  const mimeType = matches[1]; // e.g., "image/png"
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1]; // png, jpeg, webp
  const fileName = uniqueFileName(extension);
  
  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('[ImageUpload] Upload failed:', error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  console.log(`[ImageUpload] ✅ Uploaded to Supabase: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

/**
 * Process image URLs: convert base64 to Supabase URLs, keep existing URLs as-is
 */
export async function processImagesForStorage(images: string[]): Promise<string[]> {
  const result: string[] = [];
  for (const img of images) {
    try {
      if (img.startsWith('data:image')) {
        // Base64 → upload to storage
        const url = await uploadImageToStorage(img);
        result.push(url);
      } else {
        // Already a URL, keep as-is
        result.push(img);
      }
    } catch (err) {
      console.warn('[ImageUpload] Failed to process image, keeping original:', err);
      result.push(img); // Keep original on failure
    }
  }
  return result;
}
