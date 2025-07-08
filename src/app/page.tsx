import { ToolList } from "@/components/tool-list";
import { db, ensureAnonymousAuth } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import type { Tool } from "@/types";
import { Github, Code } from "lucide-react";
import Link from "next/link";

async function getTools(): Promise<Tool[]> {
  if (!db) {
    console.warn("Firebase is not configured. Returning empty list of tools.");
    return [];
  }
  try {
    await ensureAnonymousAuth();
    const toolsRef = ref(db, "tools");
    const snapshot = await get(toolsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const loadedTools: Tool[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        tags: Array.isArray(data[key].tags) ? data[key].tags : [],
      }));
      return loadedTools;
    }
    return [];
  } catch (error) {
    console.error("Firebase read failed:", error);
    return [];
  }
}

export default async function HomePage() {
  const tools = await getTools();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Code className="h-10 w-10 text-accent"/>
            <h1 className="text-4xl font-bold font-headline">DevHub</h1>
          </div>
          <p className="text-muted-foreground hidden md:block">Curated open-source dev tools.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ToolList initialTools={tools} />
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground border-t">
        <p>Built for the modern developer.</p>
        <Link href="/admin" className="text-sm hover:text-accent transition-colors mt-2">
            Admin Panel
        </Link>
      </footer>
    </div>
  );
}
