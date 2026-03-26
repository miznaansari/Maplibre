"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { addAdmin } from "./action";
import CustomInputField from "@/app/admin/UI/common/CustomInputField";
import UploadImage from "@/app/component/UploadImage";
import { useToast } from "@/app/admin/context/ToastProvider";

const initialState = {
  success: false,
  errors: {},
};

function SubmitButton({ label }) {
  const { pending } = useFormStatus();

  return (
  <button
  type="submit"
  disabled={pending}
  className={`w-full px-5 py-3 font-medium text-white rounded-lg 
    bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200 ease-in-out
    ${pending ? "opacity-60 cursor-not-allowed" : ""}`}
>
  {pending ? "Saving..." : label}
</button>

  );
}

export default function AddAdmin() {
  const {showToast} = useToast();

  const [state, formAction] = useActionState(addAdmin, initialState);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  // Default image if none uploaded
  const previewImage = uploadedImageUrls[0] || "/images/not-found.png";
useEffect(() => {
  // ✅ Success toast
  if (state.success) {
    showToast("Admin created successfully", "success");
  }

  // ❌ Error toast
  if (!state.success && state.message) {
    showToast(state.message, "error");
  }
}, [state.success, state.message, showToast]);
  return (
    <div className="bg-white m-2 p-6 rounded shadow ">
      <h2 className="text-2xl font-semibold mb-6 ">Add New Admin</h2>

      <form
        action={formAction}
        className="flex flex-col md:flex-row gap-6 p-6 bg-white shadow rounded"
      >
        {/* LEFT: IMAGE UPLOAD */}
        <div className="md:w-1/3 flex flex-col items-center gap-4">
          {/* Image Preview */}
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded overflow-hidden flex items-center justify-center bg-gray-50">
            <img
              src={previewImage}
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Upload Button */}
          <UploadImage
            uploadType="adminImage"
            onSuccess={(urls) => setUploadedImageUrls(urls)}
          >
            {({ openFileDialog }) => (
              <button
                type="button"
                onClick={openFileDialog}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Upload Image
              </button>
            )}
          </UploadImage>

          {/* Hidden inputs to send to server */}
          {uploadedImageUrls.map((url, index) => (
            <input key={index} type="hidden" name="image_url" value={url} />
          ))}
        </div>

        {/* RIGHT: FORM */}
        <div className="md:w-2/3 flex flex-col gap-4">
          <CustomInputField
            label="Name"
            name="name"
            placeholder="Admin name"
            error={state.errors?.name}
          />

          <CustomInputField
            label="Email"
            name="email"
            type="email"
            placeholder="Admin email"
            error={state.errors?.email}
          />

          <CustomInputField
            label="Password"
            name="password"
            type="password"
            placeholder="********"
            error={state.errors?.password}
          />

          <SubmitButton label="Add Admin" />

          {state.success && (
            <p className="text-green-600 text-sm mt-2">
              Admin added successfully ✅
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
