import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import React, { createContext, useContext, useRef } from "react";
import { Product } from "./productStore";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (item: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  toggleMenu: () => void;
};

export const createCartStore = () =>
  createStore<CartStore>()(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
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
          return items.reduce(
            (sum, i) => sum + i.product.price * i.quantity,
            0
          );
        },

        toggleMenu: () => {
          set((state) => ({ ...state, isOpen: !state.isOpen }));
        },
      }),
      {
        name: "cart-storage",
        partialize: (state) => ({ items: state.items }),
      }
    )
  );

const CartContext = createContext<ReturnType<typeof createCartStore> | null>(
  null
);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createCartStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createCartStore();
  }

  return (
    <CartContext.Provider value={storeRef.current}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartStore = <T,>(selector: (state: CartStore) => T): T => {
  const store = useContext(CartContext);
  if (!store)
    throw new Error("useCartStore must be used within a CartProvider");
  return useStore(store, selector);
};
