import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`bg-[#7559FF] hover:bg-[#6147DD] focus:bg-[#6147DD] text-white text-sm font-medium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#7559FF] focus:ring-offset-2 focus:ring-offset-zinc-900 ${className}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
