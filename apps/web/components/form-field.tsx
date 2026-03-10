type FormFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
};

export function FormField({ label, placeholder, type = "text" }: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">{label}</span>
      <input
        className="rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none transition focus:border-black/20"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
