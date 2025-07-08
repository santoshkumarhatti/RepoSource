import { db } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import type { Tool } from "@/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getTool(id: string): Promise<Tool | null> {
  if (!db) {
    console.warn("Firebase is not configured. Returning null.");
    return null;
  }
  try {
    const toolRef = ref(db, `tools/${id}`);
    const snapshot = await get(toolRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id,
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    }
    return null;
  } catch (error) {
    console.error("Firebase read failed:", error);
    return null;
  }
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = await getTool(params.id);

  if (!tool) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
       <header className="container mx-auto px-4 py-6">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all tools
          </Link>
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-lg shadow-lg">
                <Image
                    src={tool.imageUrl || "https://placehold.co/600x400.png"}
                    alt={tool.name}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract technology"
                />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{tool.name}</h1>
              <p className="text-lg text-muted-foreground">{tool.description}</p>
            </div>
            {tool.details && (
                <div className="pt-6">
                    <Separator />
                    <h2 className="text-3xl font-bold mt-8 mb-4">Details</h2>
                    <div className="space-y-4 text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {tool.details}
                    </div>
                </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary">{tool.category}</Badge>
                     </div>
                     <div className="space-y-2">
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {tool.tags.map((tag, index) => (
                                <Badge key={`${tag}-${index}`} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                     </div>
                     <Separator className="my-4" />
                     <Button asChild className="w-full">
                        <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                            Visit Site
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                     </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
