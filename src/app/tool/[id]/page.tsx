import { db } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import type { Software } from "@/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getSoftware(id: string): Promise<Software | null> {
  if (!db) {
    console.warn("Firebase is not configured. Returning null.");
    return null;
  }
  try {
    const softwareRef = ref(db, `tools/${id}`);
    const snapshot = await get(softwareRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id,
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: Array.isArray(data.featured) ? data.featured : [],
      };
    }
    return null;
  } catch (error) {
    console.error("Firebase read failed:", error);
    return null;
  }
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const software = await getSoftware(params.id);

  if (!software) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
       <header className="container mx-auto px-4 py-6">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all software
          </Link>
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-lg shadow-lg">
                <Image
                    src={software.imageUrl || "https://placehold.co/600x400.png"}
                    alt={software.name}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract technology"
                />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{software.name}</h1>
              <p className="text-lg text-muted-foreground">{software.description}</p>
            </div>
            {software.details && (
                <div className="pt-6">
                    <Separator />
                    <h2 className="text-3xl font-bold mt-8 mb-4">Details</h2>
                    <div className="space-y-4 text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {software.details}
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
                        <Badge variant="secondary">{software.category}</Badge>
                     </div>
                     <div className="space-y-2">
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {software.tags.map((tag, index) => (
                                <Badge key={`${tag}-${index}`} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                     </div>
                     <Separator className="my-4" />
                     <Button asChild className="w-full">
                        <Link href={software.link} target="_blank" rel="noopener noreferrer">
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
