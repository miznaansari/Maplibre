"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function FormInput({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  error,
  placeholder = "",
  textarea = false,
}) {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={name} className="font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {textarea ? (
        <Textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
      ) : (
        <Input
          id={name}
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}