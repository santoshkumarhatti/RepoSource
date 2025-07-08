
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Banner } from "@/types";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnFocusIn: false, stopOnMouseEnter: false })
  );

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={banner.id}>
            <Link
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
            >
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg">
                <Image
                  src={banner.imageUrl}
                  alt="Promotional banner"
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  data-ai-hint="advertisement banner"
                  draggable={false}
                />
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-black/30 text-white border-none hover:bg-black/50" />
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-black/30 text-white border-none hover:bg-black/50" />
    </Carousel>
  );
}
