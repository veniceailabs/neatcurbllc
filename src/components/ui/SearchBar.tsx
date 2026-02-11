"use client";

type SearchBarProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, placeholder, onChange }: SearchBarProps) {
  return (
    <div className="search-shell">
      <input
        className="search-input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

