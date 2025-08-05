import React from "react";

interface InputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  autoCorrect?: 'on' | 'off';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}

export const Input = (props: InputProps) => {
  return (
    <input
      className={`w-full text-white text-sm bg-zinc-700 py-3 px-6 rounded-lg outline-none min-h-[44px] touch-manipulation ${props.className}`}
      placeholder={props.placeholder}
      type="text"
      inputMode={props.inputMode || 'text'}
      autoComplete={props.autoComplete || 'off'}
      autoCapitalize={props.autoCapitalize || 'sentences'}
      autoCorrect={props.autoCorrect || 'on'}
      enterKeyHint={props.enterKeyHint || 'enter'}
      value={props.value || ""}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};
