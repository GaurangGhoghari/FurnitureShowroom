import { useEffect, useState } from "react";

const DebouncedSearch = ({
  value = "",
  onSearch,
  placeholder = "Search products...",
  delay = 500,
}) => {
  const [searchInput, setSearchInput] = useState(value);

  // Parent value changes thay tyare input sync રાખો
  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  // User typing close kare pasi j search callback call thay 
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedValue = searchInput.trim();

      if (trimmedValue !== value.trim()) {
        onSearch(trimmedValue);
      }
    }, delay);

    //new character type thay to old timer cancel thase 
    return () => clearTimeout(timer);
  }, [searchInput, delay, onSearch, value]);

  return (
    <input
      type="text"
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-amber-700"
    />
  );
};

export default DebouncedSearch;