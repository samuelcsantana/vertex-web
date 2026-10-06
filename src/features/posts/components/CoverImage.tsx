import Image from "next/image";

import { isBucketMediaUrl } from "@/lib/media-url";

interface CoverImageProps {
  src: string;
  alt: string;
  sizes: string;
  className: string;
  priority?: boolean;
}

export function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: CoverImageProps) {
  if (isBucketMediaUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        sizes={sizes}
        priority={priority}
        quality={90}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}
