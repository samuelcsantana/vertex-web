import Image from "next/image";

import { isBucketMediaUrl } from "@/lib/media-url";

interface CoverImageProps {
  src: string;
  alt: string;
  /**
   * Rendered-width hints for next/image's srcset selection — pass the
   * layout's real column widths so the optimizer serves the card-sized
   * variant, not the original.
   */
  sizes: string;
  className: string;
  /** Set on the post page, where the cover is almost always the LCP element. */
  priority?: boolean;
}

/**
 * Post cover renderer. Covers from our own media bucket go through
 * next/image, which resizes on the fly and serves AVIF/WebP at the rendered
 * size — this is what keeps pre-existing full-resolution uploads cheap on the
 * listing without reprocessing anything in the bucket. Arbitrary pasted URLs
 * can't go through the optimizer (its remotePatterns allowlist is the bucket
 * host only), so they keep the plain <img> path.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: CoverImageProps) {
  if (isBucketMediaUrl(src)) {
    return (
      // width/height only declare the aspect ratio for layout and srcset
      // generation; the visible geometry still comes from the caller's
      // aspect-[1200/630] + object-cover classes, same as the <img> branch.
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, outside the optimizer's remotePatterns allowlist
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}
