type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400">
              {columns.map((column) => (
                <th key={column.key} className={`px-5 py-4 font-medium ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className={`px-5 py-4 align-top text-slate-200 ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
