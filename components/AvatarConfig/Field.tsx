interface FieldProps {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
  description?: string;
}

export const Field = (props: FieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-1">
        <label 
          className="text-zinc-200 text-sm font-medium flex items-center gap-1"
          title={props.tooltip}
        >
          {props.label}
          {props.tooltip && (
            <span className="text-zinc-500 text-xs cursor-help" title={props.tooltip}>
              ⓘ
            </span>
          )}
        </label>
        {props.description && (
          <p className="text-zinc-400 text-xs leading-relaxed">{props.description}</p>
        )}
      </div>
      {props.children}
    </div>
  );
};
