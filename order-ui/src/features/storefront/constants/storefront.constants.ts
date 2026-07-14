import type { MenuItem } from "@/types/storefront";

export const CATEGORIES = ["Burgers", "Chicken", "Pizza", "Salads", "Sides", "Drinks", "Desserts"];

export const MENU: MenuItem[] = [
    {
        id: "m1", name: "Double Smash Burger", price: 14.99, category: "Burgers", rating: 4.9,
        description: "Two smashed beef patties, cheddar, pickles, shredded lettuce, house sauce on a brioche bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (6oz)", price: 0 }, { id: "s2", label: "Double Patty (10oz)", price: 4.00 }],
        addons: [{ id: "a1", label: "Extra Bacon", price: 2.00 }, { id: "a2", label: "Extra Cheese", price: 1.50 }, { id: "a3", label: "Avocado", price: 1.50 }, { id: "a4", label: "Truffle Mayo", price: 1.00 }],
    },
    {
        id: "m2", name: "Crispy Chicken Sandwich", price: 13.49, category: "Chicken", rating: 4.8,
        description: "Double-fried chicken thigh, spicy mayo, coleslaw, pickled jalapeños on a toasted potato roll.",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Classic", price: 0 }, { id: "s2", label: "Spicy +1 Level", price: 0.50 }],
        addons: [{ id: "a1", label: "Add Avocado", price: 1.50 }, { id: "a2", label: "BBQ Sauce", price: 0.50 }],
    },
    {
        id: "m3", name: "Margherita Pizza 12\"", price: 18.99, category: "Pizza", rating: 4.7,
        description: "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil on a hand-tossed crust.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "10\" Personal", price: -3.00 }, { id: "s2", label: "12\" Standard", price: 0 }, { id: "s3", label: "16\" Large", price: 6.00 }],
        addons: [{ id: "a1", label: "Extra Cheese", price: 2.00 }, { id: "a2", label: "Truffle Oil", price: 2.50 }, { id: "a3", label: "Pepperoni", price: 2.50 }],
    },
    {
        id: "m4", name: "Caesar Salad", price: 11.99, category: "Salads", rating: 4.6,
        description: "Romaine hearts, house-made Caesar dressing, Parmigiano-Reggiano, anchovy croutons.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Grilled Chicken", price: 4.00 }, { id: "a2", label: "Jumbo Shrimp", price: 5.50 }],
    },
    {
        id: "m5", name: "Truffle Loaded Fries", price: 10.99, category: "Sides", rating: 4.8,
        description: "Hand-cut fries, truffle oil, aged Parmesan, fresh herbs, garlic aioli dipping sauce.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Truffle Oil", price: 1.50 }, { id: "a2", label: "Bacon Crumbles", price: 1.50 }],
    },
    {
        id: "m6", name: "Strawberry Milkshake", price: 7.49, category: "Drinks", rating: 4.9,
        description: "House-churned vanilla ice cream blended with fresh strawberry compote, topped with whipped cream.",
        image: "https://images.unsplash.com/photo-1541658016709-82763f21784a?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (16oz)", price: 0 }, { id: "s2", label: "Large (24oz)", price: 2.00 }],
        addons: [{ id: "a1", label: "Extra Scoop", price: 1.50 }],
    },
    {
        id: "m7", name: "Caramel Latte", price: 5.99, category: "Drinks", rating: 4.7,
        description: "Double-shot espresso, steamed whole milk, house caramel drizzle, served hot or iced.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Hot", price: 0 }, { id: "s2", label: "Iced", price: 0.50 }],
        addons: [{ id: "a1", label: "Oat Milk", price: 0.80 }, { id: "a2", label: "Almond Milk", price: 0.80 }, { id: "a3", label: "Extra Shot", price: 1.00 }],
    },
    {
        id: "m8", name: "Chocolate Brownie", price: 6.49, category: "Desserts", rating: 4.9,
        description: "Warm fudge brownie, single-origin chocolate, salted caramel swirl, served with vanilla bean ice cream.",
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Ice Cream", price: 1.50 }, { id: "a2", label: "Hot Fudge Sauce", price: 0.75 }],
    },
];