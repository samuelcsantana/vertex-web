// Browser-only: shrinks an image before it ever leaves the visitor's machine,
// so the bucket never stores a camera-original multi-megabyte file. Runs in
// the upload handlers (upload-image.ts / upload-avatar.ts), never on the
// server.

// 2× the 1200px layout width covers retina displays; anything beyond that is
// wasted bytes at every size this app ever renders a cover or inline image.
const DEFAULT_MAX_DIMENSION = 2400;

// Files already this small aren't worth a lossy re-encode round-trip even if
// their pixel dimensions are within bounds.
const SMALL_FILE_BYTES = 300 * 1024;

const WEBP_QUALITY = 0.85;

interface DownscaleImageOptions {
  /** Cap for the longest side, in pixels. Aspect ratio is preserved. */
  maxDimension?: number;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function renameForType(fileName: string, type: string): string {
  const extension =
    type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName}.${extension}`;
}

/**
 * Downscales `file` so its longest side is at most `maxDimension` and
 * re-encodes it as WebP (falling back to the original format where the
 * browser can't encode WebP, e.g. older Safari). Never upscales. Returns the
 * original file untouched when it's already small enough, when decoding
 * fails, or when the re-encoded result somehow comes out larger.
 */
export async function downscaleImage(
  file: File,
  { maxDimension = DEFAULT_MAX_DIMENSION }: DownscaleImageOptions = {}
): Promise<File> {
  let bitmap: ImageBitmap;

  try {
    // createImageBitmap applies EXIF orientation, so the re-encoded copy is
    // upright without any rotation handling of our own.
    bitmap = await createImageBitmap(file);
  } catch {
    // Undecodable in this browser — upload the original rather than fail.
    return file;
  }

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= SMALL_FILE_BYTES) {
      return file;
    }

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);

    // A browser without WebP encoding silently falls back to PNG in toBlob —
    // detect that via blob.type and re-encode in the file's own format
    // instead (JPEG stays lossy-small; PNG keeps transparency).
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, file.type, WEBP_QUALITY);
    }

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], renameForType(file.name, blob.type), {
      type: blob.type,
    });
  } finally {
    bitmap.close();
  }
}
