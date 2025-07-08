"use client";

import React, { useState, useMemo } from 'react';
import type { Software } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SoftwareCard } from './tool-card';
import { Search } from 'lucide-react';

interface SoftwareListProps {
  initialSoftware: Software[];
}

export function SoftwareList({ initialSoftware }: SoftwareListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');

  const categories = useMemo(() => {
    const allCategories = new Set(initialSoftware.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(allCategories).sort()];
  }, [initialSoftware]);

  const filteredSoftware = useMemo(() => {
    return initialSoftware.filter(item => {
      const matchesFeatured = selectedFeatured === 'all' || (item.featured || []).includes(selectedFeatured);
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description.toLowerCase().includes(lowerCaseSearchTerm);
      return matchesFeatured && matchesCategory && matchesSearch;
    });
  }, [initialSoftware, searchTerm, selectedCategory, selectedFeatured]);

  return (
    <div>
      <div className="flex justify-center">
        <Tabs value={selectedFeatured} onValueChange={setSelectedFeatured} className="w-full sm:w-auto">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Top Trending">Trending</TabsTrigger>
            <TabsTrigger value="Latest">Latest</TabsTrigger>
            <TabsTrigger value="Hot">Hot</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="my-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search software by name or description..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSoftware.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSoftware.map(item => (
            <SoftwareCard key={item.id} software={item} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-card-foreground/50">
          <h2 className="text-2xl font-semibold">No Software Found</h2>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filter settings.
          </p>
        </div>
      )}
    </div>
  );
}
