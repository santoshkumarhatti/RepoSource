export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  link: string;
  imageUrl?: string;
  details?: string;
  featured?: string[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
}
