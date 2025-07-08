"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { type CarouselApi } from "@/components/ui/carousel";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Banner } from "@/types";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (api && !api.clickAllowed()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Carousel
      setApi={setApi}
      plugins={[plugin.current]}
      className="w-full cursor-grab active:cursor-grabbing"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
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
              onClickCapture={handleClick}
              draggable={false}
            >
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg">
                <Image
                  src={banner.imageUrl}
                  alt="Promotional banner"
                  fill
                  className="object-cover pointer-events-none"
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
    </Carousel>
  );
}
