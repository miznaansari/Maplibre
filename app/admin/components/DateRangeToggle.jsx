export default function DateRangeToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[3, 6].map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded text-sm ${
            value === m ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          {m} Months
        </button>
      ))}
    </div>
  );
}
