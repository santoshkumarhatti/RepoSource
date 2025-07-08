"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, remove, set, push, update } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import type { Tool } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolForm } from "@/components/admin/tool-form";
import { PlusCircle, Edit, Trash2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      if (!db) {
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Firebase is not configured. Please check environment variables.",
        });
        setIsLoading(false);
        return;
      }
      const toolsRef = ref(db, "tools/");
      const unsubscribe = onValue(
        toolsRef,
        (snapshot) => {
          const data = snapshot.val();
          const loadedTools: Tool[] = [];
          if (data) {
            for (const key in data) {
              loadedTools.push({ id: key, ...data[key] });
            }
          }
          setTools(loadedTools.reverse());
          setIsLoading(false);
        },
        (error: any) => {
          console.error("Firebase read error:", error);
          let description = "An unexpected error occurred. Could not load tools.";
          if (error.message && error.message.includes('PERMISSION_DENIED')) {
             description = "Permission Denied. Please update your Firebase Realtime Database rules to allow reads for authenticated users.";
          } else if (error.message) {
            description = error.message;
          }
          toast({
            variant: "destructive",
            title: "Database Error",
            description: description,
          });
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Auth is not configured."});
      return;
    }
    await auth.signOut();
    router.push('/');
  };

  const handleFormSubmit = async (values: Omit<Tool, "id" | "tags"> & { tags: string }) => {
    if (!db) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Database is not configured."});
      return;
    }
    const toolData = {
      name: values.name,
      description: values.description,
      category: values.category,
      link: values.link,
      imageUrl: values.imageUrl || "",
      details: values.details || "",
      tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if (editingTool) {
        const toolRef = ref(db, `tools/${editingTool.id}`);
        await update(toolRef, toolData);
        toast({ title: "Success", description: "Tool updated successfully." });
      } else {
        const toolsListRef = ref(db, "tools");
        const newToolRef = push(toolsListRef);
        await set(newToolRef, toolData);
        toast({ title: "Success", description: "Tool added successfully." });
      }
      setEditingTool(null);
    } catch (error: any) {
      console.error("Failed to save tool:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.message && error.message.includes('PERMISSION_DENIED')) {
        description = "Permission Denied. Please update your Firebase Realtime Database rules to allow writes for authenticated users.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error Saving Tool",
        description: description,
      });
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!db) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Database is not configured."});
      return;
    }
    try {
      await remove(ref(db, `tools/${toolId}`));
      toast({ title: "Success", description: "Tool deleted successfully." });
    } catch (error: any) {
       console.error("Failed to delete tool:", error);
       let description = "Failed to delete tool. Please try again.";
       if (error.message && error.message.includes('PERMISSION_DENIED')) {
         description = "Permission Denied. Please update your Firebase Realtime Database rules to allow deletes for authenticated users.";
       }
       toast({
        variant: "destructive",
        title: "Error Deleting Tool",
        description: description,
      });
    }
  };

  const openEditForm = (tool: Tool) => {
    setEditingTool(tool);
  };
  
  const openAddForm = () => {
    setEditingTool(null);
  }

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[550px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
            <Button onClick={openAddForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Tool
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Loading tools...
                    </TableCell>
                  </TableRow>
                ) : tools.length > 0 ? (
                  tools.map((tool) => (
                    <TableRow key={tool.id} className={editingTool?.id === tool.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{tool.category}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(tool)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the tool.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(tool.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No tools found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolForm 
                onSubmit={handleFormSubmit} 
                initialData={editingTool} 
                onClose={() => setEditingTool(null)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
