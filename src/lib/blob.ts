import { put, list, del, type PutBlobResult } from "@vercel/blob";

/**
 * Checks whether Vercel Blob storage is configured via BLOB_READ_WRITE_TOKEN.
 */
export function isVercelBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Uploads a file or buffer to Vercel Blob storage with public access.
 */
export async function uploadToVercelBlob(
  pathname: string,
  body: Blob | Buffer | ReadableStream | string,
  options?: {
    contentType?: string;
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
  }
): Promise<PutBlobResult> {
  if (!isVercelBlobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN saknas. Vänligen konfigurera Vercel Blob i Vercel Dashboard eller i din .env.local fil."
    );
  }

  return put(pathname, body, {
    access: "public",
    contentType: options?.contentType,
    addRandomSuffix: options?.addRandomSuffix ?? true,
    cacheControlMaxAge: options?.cacheControlMaxAge ?? 31536000,
  });
}

/**
 * Deletes a blob from Vercel Blob storage by its public URL.
 */
export async function deleteFromVercelBlob(url: string): Promise<void> {
  if (!isVercelBlobConfigured()) return;
  await del(url);
}

/**
 * Lists blobs in Vercel Blob storage with an optional prefix.
 */
export async function listVercelBlobs(prefix?: string) {
  if (!isVercelBlobConfigured()) return { blobs: [] };
  return list({ prefix });
}
