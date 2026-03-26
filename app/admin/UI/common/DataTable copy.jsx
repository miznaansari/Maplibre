import { useEffect, useState } from "react";

export default function DataTable({ columns, data }) {
  const [tableHeight, setTableHeight] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      // Adjust this offset based on your layout (header, filters, etc.)
      setTableHeight(window.innerHeight - 220);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="overflow-hidden  border border-gray-200 bg-white"
      style={{ height: tableHeight }}
    >
      <div className="h-full overflow-auto">
        <table className="w-full border-collapse text-sm">

          {/* Table Head */}
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${col.align || "text-left"
                    }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-700 ${col.align || "text-left"
                        }`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
