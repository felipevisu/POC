import { useProductStore } from "../store/productStore";

const categories = ["Animal", "Alien", "Monster"];

const buttonDefault =
  "px-6 py-2 border-2 border-gray-200 rounded-full cursor-pointer font-bold hover:bg-gray-200 hover:text-black";

const buttonActive = buttonDefault + " bg-gray-200 text-black";

export const Filters = () => {
  const { filters, setCategory, setSort } = useProductStore((state) => state);
  return (
    <div className="flex px-6 py-6 border-b-1 border-gray-500">
      <div className="grow-1 flex gap-4">
        <button
          className={filters.category === null ? buttonActive : buttonDefault}
          onClick={() => setCategory(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            className={filters.category === c ? buttonActive : buttonDefault}
            key={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div>
        <button
          className={buttonDefault}
          onClick={() =>
            setSort(
              filters.sort === null
                ? "price-asc"
                : filters.sort === "price-asc"
                ? "price-desc"
                : "price-asc"
            )
          }
        >
          {filters.sort === null || filters.sort === "price-desc"
            ? "Price ↑"
            : "Price ↓"}
        </button>
      </div>
    </div>
  );
};
