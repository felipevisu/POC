import { create } from "zustand";
import { Product } from "./productStore";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (item: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (item, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.product.id === item.id
      );

      if (existingIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
        return { items: updatedItems };
      }

      return {
        items: [...state.items, { product: item, quantity }],
      };
    });
  },

  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const items = get().items;
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },
}));
