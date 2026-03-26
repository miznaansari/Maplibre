"use client";

import React, { useEffect, useState } from "react";
import { updateProduct } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import UploadImage from "@/app/component/UploadImage";
import CustomInputField from "@/app/admin/UI/common/CustomInputField";

export default function EditProduct({ categories, product }) {
    console.log('productproduct',product)
  /* ───────────────── IMAGE STATE ───────────────── */
  const [images, setImages] = useState(() => {
    if (!product?.product_images?.length) return [];

    const hasPrimary = product.product_images.some(
      (img) => img.is_primary
    );

    return product.product_images.map((img, index) => ({
      id: img.id,
      url: img.image_url,
      image_url: img.image_url,
      is_primary: hasPrimary ? img.is_primary : index === 0,
    }));
  });

  /* ───────────────── FORM STATE ───────────────── */
  const initialState = {
    success: false,
    errors: {},
    values: product,
  };

  const [state, action, pending] = React.useActionState(
    updateProduct,
    initialState
  );

  /* ───────────────── TOAST ───────────────── */
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast({ type: "success", message: "Product updated successfully" });
    }

    if (state.errors && Object.keys(state.errors).length > 0) {
      showToast({
        type: "error",
        message: state.errors.general || "Failed to update product",
      });
    }
  }, [state.success, state.errors, showToast]);

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="space-y-6">
      <div className="rounded border border-gray-200 bg-white shadow">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold">Edit Product</h1>
        </div>

        <form action={action} className="p-6 space-y-5" noValidate>
          <input type="hidden" name="id" value={product.id} />

          {/* NAME + CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInputField
              label="Product Name"
              name="name"
              defaultValue={state.values?.name}
              error={state.errors?.name}
            />

            <CustomInputField
              label="Category"
              name="category"
              as="select"
              defaultValue={state.values?.category}
              options={categories.map((cat) => ({
                value: `${cat.id}||${cat.path}`,
                label: cat.path,
              }))}
            />
          </div>

          {/* SKU */}
          <CustomInputField
            label="SKU"
            name="sku"
            defaultValue={state.values?.sku}
          />

          {/* DESCRIPTION */}
          <CustomInputField
            label="Description"
            name="description"
            as="textarea"
            className="h-24"
            defaultValue={state.values?.description}
          />

          {/* MEASURE + STEPPER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInputField
              label="Measure Unit"
              name="measure_unit"
              placeholder="e.g. kg, pcs"
              defaultValue={state.values?.measure_unit}
              error={state.errors?.measure_unit}
            />

            <CustomInputField
              label="Stepper Value"
              name="stepper_value"
              type="number"
              defaultValue={state.values?.stepper_value}
              error={state.errors?.stepper_value}
            />
          </div>

          {/* PRICES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInputField
              label="Regular Price"
              name="regular_price"
              type="number"
              defaultValue={state.values?.regular_price}
              error={state.errors?.regular_price}

            />

            <CustomInputField
              label="Sale Price"
              name="sale_price"
              type="number"
              defaultValue={state.values?.sale_price}
                         error={state.errors?.sale_price}

              
            />
          </div>

          {/* STOCK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInputField
              label="Stock Quantity"
              name="stock_qty"
              type="number"
              defaultValue={state.values?.stock_qty}
              error={state.errors?.stock_qty}
            />

            <CustomInputField
              label="Weight (kg)"
              name="weight"
              type="number"
              defaultValue={state.values?.weight}
                error={state.errors?.weight}
            />
          </div>

          {/* IMAGES */}
          <div className="space-y-3">
            <label className="label">Product Images</label>

            <UploadImage
              uploadType="productImage"
              onSuccess={(urls) => {
                setImages((prev) => {
                  const existing = new Set(
                    prev.map((img) => img.image_url)
                  );

                  const newImages = urls
                    .filter((url) => !existing.has(url))
                    .map((url, i) => ({
                      url,
                      image_url: url,
                      is_primary: prev.length === 0 && i === 0,
                    }));

                  return [...prev, ...newImages];
                });
              }}
            />

            <input
              type="hidden"
              name="images"
              value={JSON.stringify(images)}
            />
          </div>

          {/* SEO */}
          <div className="border rounded p-4 space-y-3">
            <h2 className="font-semibold">SEO</h2>

            <CustomInputField
              label="Meta Title"
              name="meta_title"
              defaultValue={state.values?.meta_title}
            />

            <CustomInputField
              label="Meta Description"
              name="meta_description"
              as="textarea"
              className="h-24"
              defaultValue={state.values?.meta_description}
            />

            <CustomInputField
              label="Focus Keyword"
              name="focus_keyword"
              defaultValue={state.values?.focus_keyword}
            />
          </div>

          <button
            disabled={pending}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            {pending ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
