"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { ChevronsUpDown, Check } from "lucide-react";

export default function CategorySelect({
  categories,
  value,
  onChange,
  error,
}) {
  const [open, setOpen] = useState(false);

  const selected = categories.find(
    (c) => value?.split("||")[0] == c.id
  );

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={`w-full justify-between ${
              error ? "border-red-500" : ""
            }`}
          >
            {selected ? selected.path : "Select category..."}

            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search category..." />

            <CommandEmpty>No category found.</CommandEmpty>

            <CommandGroup className="max-h-60 overflow-auto">
              {categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.path}
                  onSelect={() => {
                    onChange(`${cat.id}||${cat.path}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selected?.id === cat.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {cat.path}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}