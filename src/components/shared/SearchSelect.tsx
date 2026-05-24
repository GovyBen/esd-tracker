import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchSelect({ options, value, onChange, placeholder = "搜索..." }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-gray-200 rounded px-2 py-1 text-sm text-left hover:border-gray-300"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="text-gray-400">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-100">
            <Search size={12} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm outline-none flex-1"
              placeholder={placeholder}
            />
          </div>
          {filtered.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50
                ${opt.value === value ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
            >
              {opt.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">无匹配结果</div>
          )}
        </div>
      )}
    </div>
  );
}
