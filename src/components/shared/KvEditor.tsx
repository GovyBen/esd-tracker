import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface KvEditorProps {
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
  keyLabel?: string;
  valueLabel?: string;
}

export function KvEditor({ data, onChange, keyLabel = "Key", valueLabel = "Value" }: KvEditorProps) {
  const [entries, setEntries] = useState<[string, string][]>(Object.entries(data));

  const update = (newEntries: [string, string][]) => {
    setEntries(newEntries);
    const obj: Record<string, string> = {};
    newEntries.forEach(([k, v]) => {
      if (k.trim()) obj[k.trim()] = v;
    });
    onChange(obj);
  };

  const setKey = (i: number, key: string) => {
    const next = [...entries];
    next[i] = [key, next[i][1]];
    update(next);
  };

  const setVal = (i: number, val: string) => {
    const next = [...entries];
    next[i] = [next[i][0], val];
    update(next);
  };

  const add = () => update([...entries, ["", ""]]);
  const remove = (i: number) => update(entries.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1fr_1fr_32px] gap-1.5 text-xs text-gray-500">
        <span>{keyLabel}</span>
        <span>{valueLabel}</span>
        <span />
      </div>
      {entries.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-1.5">
          <input
            value={k}
            onChange={(e) => setKey(i, e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
            placeholder={keyLabel}
          />
          <input
            value={v}
            onChange={(e) => setVal(i, e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
            placeholder={valueLabel}
          />
          <button onClick={() => remove(i)} className="flex items-center justify-center text-gray-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
        <Plus size={12} /> 添加
      </button>
    </div>
  );
}
