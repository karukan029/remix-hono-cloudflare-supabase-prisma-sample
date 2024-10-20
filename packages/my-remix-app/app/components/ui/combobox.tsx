"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { forwardRef, useState } from "react";

import { Button, type ButtonProps } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export type ComboboxProps = ButtonProps & {
  items: { label: string; value: string }[];
  setValue: (value: string) => void;
  value: string;
  placeholder?: string;
  defaultLabel?: string;
};

type HTMLComboboxElement = HTMLButtonElement;

const Combobox = forwardRef<HTMLComboboxElement, ComboboxProps>(
  (
    {
      className,
      type,
      items,
      value,
      setValue,
      placeholder,
      defaultLabel = "Not Selected ...",
      asChild = false,
      ...buttonProps
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            ref={ref}
            {...buttonProps}
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : defaultLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = "Combobox";

export { Combobox };
