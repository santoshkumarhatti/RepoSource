"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, remove, set, push, update } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import type { Software } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SoftwareForm } from "@/components/admin/tool-form";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
          const loadedSoftware: Software[] = [];
          if (data) {
            for (const key in data) {
              loadedSoftware.push({ id: key, ...data[key] });
            }
          }
          setSoftwareList(loadedSoftware.reverse());
          setIsLoading(false);
        },
        (error: any) => {
          console.error("Firebase read error:", error);
          let description = "An unexpected error occurred. Could not load software.";
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

  const handleFormSubmit = async (values: Omit<Software, "id" | "tags"> & { tags: string }) => {
    if (!db) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Database is not configured."});
      return;
    }
    const softwareData = {
      name: values.name,
      description: values.description,
      category: values.category,
      link: values.link,
      imageUrl: values.imageUrl || "",
      details: values.details || "",
      tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if (editingSoftware) {
        const softwareRef = ref(db, `tools/${editingSoftware.id}`);
        await update(softwareRef, softwareData);
        toast({ title: "Success", description: "Software updated successfully." });
      } else {
        const softwareListRef = ref(db, "tools");
        const newSoftwareRef = push(softwareListRef);
        await set(newSoftwareRef, softwareData);
        toast({ title: "Success", description: "Software added successfully." });
      }
      setEditingSoftware(null);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Failed to save software:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.message && error.message.includes('PERMISSION_DENIED')) {
        description = "Permission Denied. Please update your Firebase Realtime Database rules to allow writes for authenticated users.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error Saving Software",
        description: description,
      });
    }
  };

  const handleDelete = async (softwareId: string) => {
    if (!db) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Database is not configured."});
      return;
    }
    try {
      await remove(ref(db, `tools/${softwareId}`));
      toast({ title: "Success", description: "Software deleted successfully." });
    } catch (error: any) {
       console.error("Failed to delete software:", error);
       let description = "Failed to delete software. Please try again.";
       if (error.message && error.message.includes('PERMISSION_DENIED')) {
         description = "Permission Denied. Please update your Firebase Realtime Database rules to allow deletes for authenticated users.";
       }
       toast({
        variant: "destructive",
        title: "Error Deleting Software",
        description: description,
      });
    }
  };

  const openEditForm = (software: Software) => {
    setEditingSoftware(software);
    setIsFormOpen(true);
  };
  
  const openAddForm = () => {
    setEditingSoftware(null);
    setIsFormOpen(true);
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
          <Skeleton className="h-[400px] w-full" />
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
                <PlusCircle className="mr-2 h-4 w-4" /> New Software
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>
      </div>

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
                  Loading software...
                </TableCell>
              </TableRow>
            ) : softwareList.length > 0 ? (
              softwareList.map((software) => (
                <TableRow key={software.id} className={editingSoftware?.id === software.id ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{software.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{software.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(software)}>
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
                            This action cannot be undone. This will permanently delete the software.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(software.id)}>
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
                  No software found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSoftware ? "Edit Software" : "Add New Software"}</DialogTitle>
          </DialogHeader>
          <SoftwareForm 
            onSubmit={handleFormSubmit} 
            initialData={editingSoftware} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
