type FormFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  name?: string;
  value?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
};

export function FormField({
  label,
  placeholder,
  type = "text",
  name,
  value,
  autoComplete,
  disabled = false,
  required = false,
  onChange
}: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58">{label}</span>
      <input
        autoComplete={autoComplete}
        className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-[#A855F7]/45 focus:bg-white/14"
        disabled={disabled}
        name={name}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
