"use client";

export default function CustomInputField({
  label,
  name,
  type = "text",
  value,
  defaultValue,
  placeholder,
  error,
  options = [],
  as = "input",
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}

      {/* INPUT */}
      {as === "input" && (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`input p-2 border border-gray-300 rounded w-full ${className}`}
          {...props}
        />
      )}

      {/* TEXTAREA */}
      {as === "textarea" && (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`input w-full border border-gray-200 ${className}`}
          {...props}
        />
      )}

      {/* SELECT */}
      {as === "select" && (
        <select
          name={name}
          defaultValue={defaultValue}
          className={`input w-full border border-gray-200 ${className}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
{error && (
      <p className="text-sm text-red-500 min-h-[20px]">
        {error}
      </p>
    )}
    </div>
  );
}
