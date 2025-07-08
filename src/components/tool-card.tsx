"use client";

import type { Software } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SoftwareCardProps {
  software: Software;
}

export function SoftwareCard({ software }: SoftwareCardProps) {
  const handleVisitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the parent Link from navigating
    e.preventDefault();
    window.open(software.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Link href={`/tool/${software.id}`} className="block h-full text-card-foreground no-underline">
      <Card className="flex flex-col h-full bg-card hover:shadow-lg hover:shadow-accent/10 transition-shadow duration-300 border-border/50 overflow-hidden group">
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          <Image
            src={software.imageUrl || "https://placehold.co/600x400.png"}
            alt={software.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="abstract technology"
          />
        </div>
        <CardHeader>
          <CardTitle>{software.name}</CardTitle>
          <CardDescription className="pt-1">{software.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2">
            {software.tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant="outline">{software.category}</Badge>
          <Button onClick={handleVisitClick} variant="ghost" size="sm" className="hover:bg-accent/20">
            Visit Site
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
