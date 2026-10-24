import { NextResponse } from "next/server";
import { isVercelBlobConfigured, uploadToVercelBlob } from "@/lib/blob";

export async function GET() {
  return NextResponse.json({
    provider: isVercelBlobConfigured() ? "vercel-blob" : "imgbb",
    vercelBlobConfigured: isVercelBlobConfigured(),
    imgbbConfigured: Boolean(process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY),
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files: File[] = [];

    // Collect all files from "files" or "file" or "image"
    const allEntries = formData.getAll("files");
    if (allEntries.length > 0) {
      for (const entry of allEntries) {
        if (entry instanceof File) {
          files.push(entry);
        }
      }
    }

    const singleFile = formData.get("file") || formData.get("image");
    if (singleFile instanceof File && !files.includes(singleFile)) {
      files.push(singleFile);
    }

    const apiKey =
      process.env.IMGBB_API_KEY ||
      process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    // Handle base64 fallback if no binary files
    if (files.length === 0) {
      const base64Str = formData.get("base64");
      if (typeof base64Str === "string" && base64Str.trim()) {
        const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, "");

        // 1. Try Vercel Blob with buffer
        if (isVercelBlobConfigured()) {
          try {
            const buffer = Buffer.from(cleanBase64, "base64");
            const filename = `urhund/upload-${Date.now()}.jpg`;
            const blob = await uploadToVercelBlob(filename, buffer, { contentType: "image/jpeg" });
            return NextResponse.json({
              success: true,
              url: blob.url,
              urls: [blob.url],
              provider: "vercel-blob",
            });
          } catch (blobErr) {
            console.warn("Vercel blob base64 upload failed, falling back to ImgBB:", blobErr);
          }
        }

        // 2. Fallback to ImgBB
        const imgBbForm = new FormData();
        imgBbForm.append("image", cleanBase64);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgBbForm,
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          return NextResponse.json({
            success: true,
            url: data.data.url,
            urls: [data.data.url],
            provider: "imgbb",
          });
        }
      }

      return NextResponse.json(
        { error: "Inga giltiga bildfiler mottogs för uppladdning." },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const useVercelBlob = isVercelBlobConfigured();

    for (const file of files) {
      let uploadedUrl: string | null = null;

      // 1. Try Vercel Blob first if configured
      if (useVercelBlob) {
        try {
          const safeName = (file.name || "dog-photo.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
          const pathname = `urhund/${Date.now()}-${safeName}`;
          const blob = await uploadToVercelBlob(pathname, file, {
            contentType: file.type || "image/jpeg",
          });
          uploadedUrl = blob.url;
        } catch (err) {
          console.warn("Vercel Blob upload failed for file, falling back to ImgBB:", err);
        }
      }

      // 2. Fallback to ImgBB if Vercel Blob wasn't configured or failed
      if (!uploadedUrl) {
        try {
          const imgBbForm = new FormData();
          imgBbForm.append("image", file, file.name || "dog-photo.png");

          const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: imgBbForm,
          });

          const data = await res.json();
          if (data.success && data.data?.url) {
            uploadedUrl = data.data.url;
          } else {
            console.warn("ImgBB upload error response for file:", file.name, data);
          }
        } catch (err) {
          console.error("Failed to upload image file to ImgBB:", err);
        }
      }

      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Kunde inte ladda upp bilderna till varken Vercel Blob eller ImgBB." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
      provider: useVercelBlob ? "vercel-blob" : "imgbb",
    });
  } catch (error: unknown) {
    console.error("Upload error in /api/upload:", error);
    const message = error instanceof Error ? error.message : "Internt uppladdningsfel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
