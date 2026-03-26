"use client";

export default function QuantityInput({ product, value, onChange }) {
  const step = product.stepper_value ?? 1;

  const normalizeQty = (val) => {
    if (!step || step === 1) return val;

    // Minimum allowed value
    if (val < step) return step;

    // Snap to nearest LOWER multiple
    return Math.floor(val / step) * step;
  };

  return (
    <div>
      <input
        type="number"
        min={step}
        step={step}
        value={value}
        onChange={(e) => {
          const raw = Number(e.target.value);
          if (isNaN(raw)) return;
          onChange(normalizeQty(raw));
        }}
        className="w-15 border p-2 rounded border-gray-300"
      />
    </div>
  );
}
