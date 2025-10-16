"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export function SearchInput({
  placeholder = "Search stories...",
  onSearch,
  onClear,
  isLoading = false,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    if (!inputValue.trim() || isLoading) return;
    onSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue("");
    onClear?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Input Container */}
      <div
        className={`
          flex items-center w-full sm:w-[320px] rounded-xl px-2 py-2
          border transition-all duration-300
          bg-background text-foreground
          border-black dark:border-white
        `}
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none px-2"
        />

        {/* Clear button - positioned on the right */}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex-shrink-0"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search button - outside the input box */}
      <Button
        onClick={handleSearch}
        disabled={isLoading || !inputValue.trim()}
        variant="default"
        className="h-10 px-4 flex-shrink-0"
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}
