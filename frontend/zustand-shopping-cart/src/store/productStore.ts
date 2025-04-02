import { create } from "zustand";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type PriceSort = "price-asc" | "price-desc";

type FilterState = {
  category: string | null;
  sort: PriceSort | null;
};

type ProductStore = {
  products: Product[];
  filters: FilterState;
  setProducts: (products: Product[]) => void;
  setCategory: (category: string | null) => void;
  setSort: (sort: FilterState["sort"]) => void;
  filteredProducts: () => Product[];
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filters: { category: null, sort: null },

  setProducts: (products) => set({ products }),

  setCategory: (category) =>
    set((state) => ({ filters: { ...state.filters, category } })),

  setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),

  filteredProducts: () => {
    const { products, filters } = get();
    let result = [...products];

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  },
}));
