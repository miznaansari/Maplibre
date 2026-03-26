"use client";

import { useState, useTransition, useEffect } from "react";

export default function ControlledAutoSelect({
  initialValue,
  name,
  options,
  onSave,
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  return (
    <form
      action={(formData) => {
        const v = formData.get(name);
        setValue(v);

        startTransition(async () => {
          await onSave(v);
        });
      }}
    >
      <select
        name={name}
        value={value}
        disabled={isPending}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.form.requestSubmit();
        }}
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {options}
      </select>
    </form>
  );
}
