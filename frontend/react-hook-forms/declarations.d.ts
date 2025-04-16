declare module "product_store/useProductStore" {
  const useProductStore: () => {
    addProduct: (data: Record<string, string | number | boolean>) => void;
  };
  export default useProductStore;
}
