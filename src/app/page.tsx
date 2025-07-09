import { SoftwareList } from "@/components/tool-list";
import { db } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import type { Software } from "@/types";
import { Code, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

async function getSoftwareList(): Promise<Software[]> {
  if (!db) {
    console.warn("Firebase is not configured. Returning empty list of software.");
    return [];
  }
  try {
    const softwareRef = ref(db, "software");
    const snapshot = await get(softwareRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const loadedSoftware: Software[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        tags: Array.isArray(data[key].tags) ? data[key].tags : [],
        featured: Array.isArray(data[key].featured) ? data[key].featured : [],
      }));
      return loadedSoftware.reverse();
    }
    return [];
  } catch (error) {
    console.error("Firebase read failed:", error);
    return [];
  }
}

export default async function HomePage() {
  const software = await getSoftwareList();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Code className="h-8 w-8 text-accent"/>
            <h1 className="text-2xl font-bold font-headline">RepoSource</h1>
          </Link>
          <nav>
             {/* Future nav links can go here */}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 pb-16 md:pb-24 pt-2">
          <SoftwareList initialSoftware={software} />
        </section>
      </main>

      <footer className="bg-card/50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-muted-foreground">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-lg text-foreground mb-2">RepoSource</h4>
              <p className="text-sm">
                A curated collection of open-source software and apps, built for the modern developer community.
              </p>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-bold text-lg text-foreground mb-2">Connect</h4>
              <div className="flex space-x-4 justify-center md:justify-end">
                <Link href="#" aria-label="Twitter" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" aria-label="GitHub" className="hover:text-accent transition-colors"><Github className="h-5 w-5" /></Link>
                <Link href="#" aria-label="LinkedIn" className="hover:text-accent transition-colors"><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} RepoSource. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
