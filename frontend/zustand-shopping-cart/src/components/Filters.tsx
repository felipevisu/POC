import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";

const categories = ["Animal", "Alien", "Monster"];

const buttonDefault =
  "px-6 py-2 border-2 border-gray-200 rounded-full cursor-pointer font-bold hover:bg-gray-200 hover:text-black";

const buttonActive = buttonDefault + " bg-gray-200 text-black";

export const Filters = () => {
  const { filters, setCategory, setSort } = useProductStore((state) => state);
  const { isOpen, toggleMenu } = useCartStore((state) => state);

  return (
    <div className="flex items-center">
      <div className="flex px-6 py-6 border-b-1 border-gray-500 grow-1 h-24">
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
      <button
        onClick={toggleMenu}
        className="cursor-pointer relative z-50 bg-white text-black w-24 h-24 flex justify-center items-center"
      >
        {!isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>
    </div>
  );
};
