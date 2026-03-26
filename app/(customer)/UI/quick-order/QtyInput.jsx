import { memo, useEffect, useRef } from "react";

function QtyInput({
  productId,
  value,
  index,
  priceRefs,
  handlePriceTab,
  onCommit,
}) {
  const inputRef = useRef(null);

  // register ref once
  useEffect(() => {
    priceRefs.current[index] = inputRef.current;
  }, [index, priceRefs]);

  // update value only when parent explicitly changes it
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value ?? "";
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      defaultValue={value ?? ""}   // 🔥 uncontrolled
      onInput={(e) => {
        // allow digits only
        e.target.value = e.target.value.replace(/\D/g, "");
      }}
      onBlur={(e) => {
        requestAnimationFrame(() => {
          onCommit(productId, e.target.value);
        });
      }}
      onKeyDown={(e) => handlePriceTab(e, index)}
      className="
        w-full
        border border-gray-400
        px-2 py-1
        text-center
        bg-white
        focus:outline-none
        focus:border-blue-500
      "
    />
  );
}

export default memo(QtyInput);
