import type { Tool } from '@/types';
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

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex flex-col h-full bg-card hover:shadow-lg hover:shadow-accent/10 transition-shadow duration-300 border-border/50">
      <CardHeader>
        <CardTitle>{tool.name}</CardTitle>
        <CardDescription className="pt-1">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline">{tool.category}</Badge>
        <Button asChild variant="ghost" size="sm" className="hover:bg-accent/20">
          <Link href={tool.link} target="_blank" rel="noopener noreferrer">
            Visit Site
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
