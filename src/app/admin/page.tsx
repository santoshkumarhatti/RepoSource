"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, remove, set } from "firebase/database";
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
import { SoftwareForm, type SoftwareFormValues } from "@/components/admin/tool-form";
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
  const [isSoftwareLoading, setIsSoftwareLoading] = useState(true);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [isSoftwareFormOpen, setIsSoftwareFormOpen] = useState(false);
  
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
          description: "Firebase is not configured.",
        });
        setIsSoftwareLoading(false);
        return;
      }
      const softwareRef = ref(db, "software/");
      const unsubscribeSoftware = onValue(
        softwareRef,
        (snapshot) => {
          const data = snapshot.val();
          const loadedSoftware: Software[] = [];
          if (data) {
            for (const key in data) {
              loadedSoftware.push({ id: key, ...data[key] });
            }
          }
          setSoftwareList(loadedSoftware.reverse());
          setIsSoftwareLoading(false);
        },
        (error: any) => {
          console.error("Firebase read error (software):", error);
          toast({ variant: "destructive", title: "Database Error", description: "Could not load software." });
          setIsSoftwareLoading(false);
        }
      );

      return () => {
        unsubscribeSoftware();
      };
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
  
  const slugify = (name: string) => {
    return name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const handleSoftwareFormSubmit = async (values: SoftwareFormValues) => {
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
      featured: values.featured || [],
    };
    const newId = slugify(values.name);
    if (!newId) {
      toast({ variant: "destructive", title: "Invalid Name", description: "Software name must contain valid characters." });
      return;
    }
    try {
      if (editingSoftware && editingSoftware.id !== newId) {
        await remove(ref(db, `software/${editingSoftware.id}`));
      }
      await set(ref(db, `software/${newId}`), softwareData);
      toast({ title: "Success", description: `Software ${editingSoftware ? 'updated' : 'added'} successfully.` });
      setEditingSoftware(null);
      setIsSoftwareFormOpen(false);
    } catch (error: any) {
      console.error("Failed to save software:", error);
      toast({ variant: "destructive", title: "Error Saving Software", description: "An unexpected error occurred." });
    }
  };
  
  const handleDeleteSoftware = async (softwareId: string) => {
    if (!db) return;
    try {
      await remove(ref(db, `software/${softwareId}`));
      toast({ title: "Success", description: "Software deleted successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Deleting Software", description: "Failed to delete software." });
    }
  };

  const openEditSoftwareForm = (software: Software) => {
    setEditingSoftware(software);
    setIsSoftwareFormOpen(true);
  };
  
  const openAddSoftwareForm = () => {
    setEditingSoftware(null);
    setIsSoftwareFormOpen(true);
  }
  
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Skeleton className="h-[600px] w-full max-w-4xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Manage Software</h2>
          <Button onClick={openAddSoftwareForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Software
          </Button>
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
              {isSoftwareLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading software...</TableCell></TableRow>
              ) : softwareList.length > 0 ? (
                softwareList.map((software) => (
                  <TableRow key={software.id}>
                    <TableCell className="font-medium">{software.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{software.category}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditSoftwareForm(software)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the software.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSoftware(software.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center h-24">No software found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isSoftwareFormOpen} onOpenChange={setIsSoftwareFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingSoftware ? "Edit Software" : "Add New Software"}</DialogTitle></DialogHeader>
          <SoftwareForm 
            onSubmit={handleSoftwareFormSubmit} 
            initialData={editingSoftware} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
