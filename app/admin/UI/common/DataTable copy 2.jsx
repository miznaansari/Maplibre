export default function DataTable({ columns, data }) {
  return (
    <div className="relative border border-gray-200 overflow-auto max-h-[60vh] md:max-h-[calc(100vh-295px)]">
      <table className="min-w-max w-full text-sm">
        {/* Sticky Header */}
        <thead className="bg-gray-50 text-gray-500 sticky top-0 z-20">
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium whitespace-nowrap ${col.align || "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 whitespace-nowrap ${col.align || "text-left"}`}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-4 text-center text-sm text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
