
import { useEffect, useState } from "react";
import { getCategories } from "../api/api";

function CategoryDropdown({
  value,
  onChange,
  includeAll = false,
  allLabel = "All Categories",
  name = "category",
  disabled = false,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories({
          status: "active",
          page: 1,
          limit: 100,
        });

        if (cancelled) return;

        const data = response.data;
        const list = Array.isArray(data.categories)
          ? data.categories
          : [];

        setCategories(list);
      } catch (err) {
        if (!cancelled) {
          setError("Categories load thai shakya nathi.");
          console.error("Category fetch error:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-amber-800"
      >
        {!includeAll && (
          <option value="">Select Category</option>
        )}

        {includeAll && (
          <option value="all">{allLabel}</option>
        )}

        {categories.map((item) => (
          <option key={item.id} value={item.category}>
            {item.category}
          </option>
        ))}
      </select>

      {loading && (
        <p className="mt-1 text-sm text-gray-500">
          Loading categories...
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default CategoryDropdown;