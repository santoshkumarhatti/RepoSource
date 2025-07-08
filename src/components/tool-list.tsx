"use client";

import React, { useState, useMemo } from 'react';
import type { Tool } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from './tool-card';
import { Search } from 'lucide-react';

interface ToolListProps {
  initialTools: Tool[];
}

export function ToolList({ initialTools }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const allCategories = new Set(initialTools.map(tool => tool.category).filter(Boolean));
    return ['all', ...Array.from(allCategories).sort()];
  }, [initialTools]);

  const filteredTools = useMemo(() => {
    return initialTools.filter(tool => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        tool.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        tool.description.toLowerCase().includes(lowerCaseSearchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [initialTools, searchTerm, selectedCategory]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools by name or description..."
            className="pl-10 w-full"
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

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-card-foreground/50">
          <h2 className="text-2xl font-semibold">No Tools Found</h2>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter settings.
          </p>
        </div>
      )}
    </div>
  );
}
