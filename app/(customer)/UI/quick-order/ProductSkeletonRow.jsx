// UI/shop/ProductSkeletonRow.jsx
export default function ProductSkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="border px-2 py-3">
        <div className="h-4 bg-gray-200 rounded" />
      </td>
      <td className="border px-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
      </td>
      <td className="border px-3">
        <div className="h-4 bg-gray-200 rounded w-48" />
      </td>
      <td className="border px-2">
        <div className="h-4 bg-gray-200 rounded w-8" />
      </td>
      <td className="border px-2">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="border px-2">
        <div className="h-4 bg-gray-200 rounded w-10" />
      </td>
      <td className="border px-2">
        <div className="h-4 bg-gray-200 rounded w-6" />
      </td>
    </tr>
  );
}
