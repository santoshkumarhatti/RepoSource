"use client";

import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
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
    const unsubscribe = onValue(toolsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTools: Tool[] = [];
      if (data) {
        for (const key in data) {
          loadedTools.push({ id: key, ...data[key] });
        }
      }
      setTools(loadedTools.reverse());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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
      ...values,
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
      setDialogOpen(false);
      setEditingTool(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
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
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tool. Please try again.",
      });
    }
  };

  const openEditDialog = (tool: Tool) => {
    setEditingTool(tool);
    setDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingTool(null);
    setDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
            <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Tool
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if (!isOpen) setEditingTool(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
          </DialogHeader>
          <ToolForm 
            onSubmit={handleFormSubmit} 
            initialData={editingTool} 
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
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
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{tool.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(tool)}>
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
  );
}
