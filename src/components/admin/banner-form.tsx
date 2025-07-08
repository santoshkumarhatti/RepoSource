"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Banner } from "@/types";

const formSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  link: z.string().url({ message: "Please enter a valid destination URL." }),
});

export type BannerFormValues = z.infer<typeof formSchema>;

interface BannerFormProps {
  initialData: Omit<Banner, 'id'> | null;
  onSubmit: (values: BannerFormValues) => void;
  onCancel: () => void;
}

export function BannerForm({ initialData, onSubmit, onCancel }: BannerFormProps) {
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
      link: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        imageUrl: "",
        link: "",
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/banner.png" {...field} />
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
              <FormLabel>Destination Link</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Banner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
