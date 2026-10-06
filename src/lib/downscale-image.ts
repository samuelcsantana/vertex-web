const DEFAULT_MAX_DIMENSION = 2400;

const SMALL_FILE_BYTES = 300 * 1024;

const WEBP_QUALITY = 0.85;

interface DownscaleImageOptions {
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

export async function downscaleImage(
  file: File,
  { maxDimension = DEFAULT_MAX_DIMENSION }: DownscaleImageOptions = {}
): Promise<File> {
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
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
