export interface Modifier {
    label: string;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    basePrice: number;
    image: string;
    modifiers: Modifier[];
    available: boolean;
}