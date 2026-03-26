"use client";

import React, { useEffect } from "react";
import { updateProduct } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";

export default function EditProduct({ categories, product }) {

    const initialState = {
        success: false,
        errors: {},
        values: product,
    };
    const [state, action, pending] = React.useActionState(
        updateProduct,
        initialState
    );
    console.log('product', product)
    const { showToast } = useToast();
    useEffect(() => {
        if (state.success) {
            showToast({
                type: "success",
                message: "Product added successfully",
            });
        }

        if (state.errors && Object.keys(state.errors).length > 0) {
            showToast({
                type: "error",
                message: state.errors.general || "Failed to add product",
            });
        }
    }, [state.success, state.errors, showToast]);



    return (
        <div className="space-y-6  ">

            {/* ✅ SUCCESS ALERT */}
            {state.success && (
                <div className="rounded border border-green-200 bg-green-50 p-4 text-green-700">
                    ✅ Product edited successfully
                </div>
            )}

            {/* ❌ GLOBAL ERROR */}
            {state.errors?.general && (
                <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
                    ❌ {state.errors.general}
                </div>
            )}

         
            {/* CARD */}
            <div className="rounded border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">

                {/* CARD HEADER */}
                <div className="border-b border-gray-200 px-6 py-4">
                        <div className="text-xl font-semibold text-gray-800">Edit Product</div>
                <p className="text-sm text-gray-500">Home &gt; Product &gt; Edit Product</p>
                </div>

                {/* FORM */}
                <form action={action} className="p-6 space-y-2" noValidate>
                    <input type="hidden" name="id" value={product.id} />

                    {/* NAME + CATEGORY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Product Name</label>
                            <input
                                name="name"
                                defaultValue={state.values?.name || ""}
                                className="input p-2 border border-gray-300 rounded w-full"

                            />
                            {state.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Category</label>
                            <select
                                name="category"
                                defaultValue={state.values?.category || ""}
                                className="input p-2 border border-gray-300 rounded w-full"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option
                                        key={cat.id}
                                        value={`${cat.id}||${cat.path}`}
                                    >
                                        {cat.path}
                                    </option>
                                ))}
                            </select>
                            {state.errors?.category && (
                                <p className="text-sm text-red-500">
                                    {state.errors.category}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="label">SKU</label>
                        <input
                            name="sku"
                            defaultValue={state.values?.sku || ""}
                            className="input p-2 border border-gray-300 rounded w-full"

                        />
                        {state.errors?.sku && (
                            <p className="text-sm text-red-500">{state.errors.sku}</p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            defaultValue={state.values?.description || ""}
                            className="input h-24 resize-none border border-gray-300 rounded w-full"

                        />
                    </div>

                    {/* PRICING */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Regular Price</label>
                            <input
                                type="number"
                                name="regular_price"
                                defaultValue={state.values?.regular_price || ""}
                                className="input p-2 border border-gray-300 rounded w-full"

                            />
                            {state.errors?.regular_price && (
                                <p className="text-sm text-red-500">
                                    {state.errors.regular_price}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Sale Price</label>
                            <input
                                type="number"
                                name="sale_price"
                                defaultValue={state.values?.sale_price || ""}
                                className="input p-2 border border-gray-300 rounded w-full"

                            />
                        </div>
                    </div>

                    {/* STOCK */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock_qty"
                                defaultValue={state.values?.stock_qty || ""}
                                className="input p-2 border border-gray-300 rounded w-full"

                            />
                            {state.errors?.stock_qty && (
                                <p className="text-sm text-red-500">
                                    {state.errors.stock_qty}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                defaultValue={state.values?.weight || ""}
                                className="input p-2 border border-gray-300 rounded w-full"

                            />
                        </div>
                    </div>

                    {/* IMAGE */}
                    <div>
                        <label className="label">Image URL</label>
                        <input
                            name="image_url"
                            defaultValue={state.values?.image_url || ""}
                            className="input p-2 border border-gray-300 rounded w-full"

                        />
                    </div>
                    {/* META DATA SECTION */}
                    <div className="rounded border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                        {/* HEADER */}
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-sm font-semibold text-gray-700">
                                Meta Data (SEO)
                            </h2>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 space-y-6">

                            {/* META TITLE */}
                            <div>
                                <label className="label">Meta Title</label>
                                <input
                                    name="meta_title"
                                    defaultValue={state.values?.meta_title || ""}
                                    className="input p-2 border border-gray-300 rounded w-full"
                                />
                                {state.errors?.meta_title && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.meta_title}
                                    </p>
                                )}
                            </div>

                            {/* META DESCRIPTION */}
                            <div>
                                <label className="label">Meta Description</label>
                                <textarea
                                    name="meta_description"
                                    defaultValue={state.values?.meta_description || ""}
                                    className="input h-24 resize-none border border-gray-300 rounded w-full"
                                />
                                {state.errors?.meta_description && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.meta_description}
                                    </p>
                                )}
                            </div>

                            {/* FOCUS KEYWORD */}
                            <div>
                                <label className="label">Focus Keyword</label>
                                <input
                                    name="focus_keyword"
                                    defaultValue={state.values?.focus_keyword || ""}
                                    className="input p-2 border border-gray-300 rounded w-full"
                                />
                                {state.errors?.focus_keyword && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.focus_keyword}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>


                    {/* SUBMIT */}
                    <div className="pt-4">
                        <button
                            // type="submit"
                            disabled={pending}
                            className="bg-blue-600 p-2 rounded text-white"
                        >
                            {pending ? "Saving..." : "Save Product"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
