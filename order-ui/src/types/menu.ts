export interface SizeOption {
  id: string;
  label: string;
  price: number;
}

export interface AddonOption {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stockQuantity: number;
  available: boolean;
  sizes?: SizeOption[];
  addons?: AddonOption[];
}
