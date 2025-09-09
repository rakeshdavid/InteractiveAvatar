import * as SelectPrimitive from "@radix-ui/react-select";
import { useState } from "react";

import { ChevronDownIcon } from "./Icons";

interface SelectProps<T> {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
  isSelected: (option: T) => boolean;
  value: string | null | undefined;
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T>(props: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectPrimitive.Root
      disabled={props.disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectPrimitive.Trigger className="w-full text-white text-sm bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600 border border-zinc-600 hover:border-zinc-500 py-3 px-4 rounded-lg cursor-pointer flex items-center justify-between h-fit disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7559FF] focus:ring-offset-2 focus:ring-offset-zinc-900">
        <div className={`${props.value ? "text-white" : "text-zinc-400"} truncate mr-2`}>
          {props.value ? props.value : props.placeholder}
        </div>
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-y-auto"
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport className="rounded-lg border border-zinc-600 bg-zinc-700 shadow-xl py-1">
            {props.options.map((option) => {
              const isSelected = props.isSelected(option);

              return (
                <div
                  key={props.renderOption(option)?.toString()}
                  className={`py-3 px-4 cursor-pointer hover:bg-zinc-600 focus:bg-zinc-600 outline-none text-sm min-h-[44px] flex items-center touch-manipulation transition-colors duration-150 ${
                    isSelected ? "text-white bg-[#7559FF] hover:bg-[#6147DD]" : "text-zinc-300 hover:text-white"
                  }`}
                  onClick={() => {
                    props.onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {props.renderOption(option)}
                </div>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
