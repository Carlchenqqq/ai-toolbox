export interface AITool {
  id: string;
  name: string;
  nameCN: string;
  description: string;
  descriptionCN: string;
  url: string;
  logo: string;
  category: string;
  tags: string[];
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Open Source';
  rating: number;
  featured?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}
