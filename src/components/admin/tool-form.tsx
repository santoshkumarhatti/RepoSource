"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Software } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(2, { message: "Category is required." }),
  tags: z.string().min(1, { message: "At least one tag is required." }),
  link: z.string().url({ message: "Please enter a valid URL." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  details: z.string().optional(),
  featured: z.array(z.string()).optional(),
});

export type SoftwareFormValues = z.infer<typeof formSchema>;

interface SoftwareFormProps {
  initialData: Software | null;
  onSubmit: (values: SoftwareFormValues) => void;
}

const featuredOptions = ["Top Trending", "Latest", "Hot"];

export function SoftwareForm({ initialData, onSubmit }: SoftwareFormProps) {
  const form = useForm<SoftwareFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: "",
      link: "",
      imageUrl: "",
      details: "",
      featured: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        tags: initialData.tags.join(", "),
        imageUrl: initialData.imageUrl || "",
        details: initialData.details || "",
        featured: initialData.featured || [],
      });
    } else {
        form.reset({
            name: "",
            description: "",
            category: "",
            tags: "",
            link: "",
            imageUrl: "",
            details: "",
            featured: [],
        });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Hoppscotch" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., API Tools" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea placeholder="Open-source alternative to Postman" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormControl>
                    <Input placeholder="API, Developer Tools, REST" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                    <Input placeholder="https://hoppscotch.io" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem className="md:col-span-2">
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
                <FormItem className="md:col-span-2">
                <FormLabel>Details (Optional)</FormLabel>
                <FormControl>
                    <Textarea 
                    placeholder="Detailed information about the software, its history, features, etc. This will be shown on its dedicated page."
                    className="h-32" 
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
              control={form.control}
              name="featured"
              render={() => (
                <FormItem className="md:col-span-2">
                  <div className="mb-2">
                    <FormLabel>Featured Lists</FormLabel>
                    <FormDescription>
                      Add this software to special lists like "Top Trending".
                    </FormDescription>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {featuredOptions.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="featured"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
