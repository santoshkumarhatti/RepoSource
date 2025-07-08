import { SoftwareList } from "@/components/tool-list";
import { db } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import type { Software } from "@/types";
import { Code } from "lucide-react";

async function getSoftwareList(): Promise<Software[]> {
  if (!db) {
    console.warn("Firebase is not configured. Returning empty list of software.");
    return [];
  }
  try {
    const softwareRef = ref(db, "tools");
    const snapshot = await get(softwareRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const loadedSoftware: Software[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        tags: Array.isArray(data[key].tags) ? data[key].tags : [],
      }));
      return loadedSoftware;
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
    <div className="bg-background text-foreground min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Code className="h-10 w-10 text-accent"/>
            <h1 className="text-4xl font-bold font-headline">RepoSource</h1>
          </div>
          <p className="text-muted-foreground hidden md:block">A collection of curated open-source software and apps.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <SoftwareList initialSoftware={software} />
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground border-t">
        <p>Built for the modern developer.</p>
      </footer>
    </div>
  );
}
