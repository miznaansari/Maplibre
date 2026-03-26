"use client";

import React, { useEffect, useState } from "react";
import { addProduct } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import UploadImage from "@/app/component/UploadImage";
import CategorySelect from "./CategorySelect";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";

import {
  SparklesIcon,
  PencilSquareIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const initialState = {
  success: false,
  errors: {},
  values: {},
};

export default function AddProductForm({ categories }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [state, action, pending] = React.useActionState(
    addProduct,
    initialState
  );

  const [mode, setMode] = useState("ai");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);

  const [category, setCategory] = useState(state.values?.category || "");
  const [images, setImages] = useState([]);

  const [formValues, setFormValues] = useState({
    name: "",
    sku: "",
    description: "",
    meta_title: "",
    meta_description: "",
    focus_keyword: "",
  });

  const [aiPreview, setAiPreview] = useState(null);

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
  }, [state.success, state.errors, showToast, router]);

  /* ---------------- AI IMAGE UPLOAD ---------------- */

  const handleAIUpload = async (file) => {
    if (!file) return;

    setAiPreview(URL.createObjectURL(file));
    setAiLoading(true);

    try {
      const res = await fetch(
        "/admin/api/ai-product",
        {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        }
      );

      const data = await res.json();

      if (data.status !== "success") {
        throw new Error(data?.data?.message || "AI extraction failed");
      }

      const ai = data.data;

      setFormValues({
        name: ai.name || "",
        sku: ai.model || "",
        description: ai.description || "",
        meta_title: ai.meta_title || "",
        meta_description: ai.meta_description || "",
        focus_keyword: ai.focus_keyword || "",
      });

      setAiFilled(true);

      showToast({
        type: "success",
        message: "AI filled product details",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err.message,
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* MODE SELECTOR */}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("ai");
              setAiFilled(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
            ${
              mode === "ai"
                ? "bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <SparklesIcon className="h-5 w-5" />
            AI Fill
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
            ${
              mode === "manual"
                ? "bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <PencilSquareIcon className="h-5 w-5" />
            Manual Fill
          </button>
        </div>

        {/* AI UPLOAD */}

        {mode === "ai" && !aiFilled && (
          <section className="border rounded-lg p-6 space-y-4 bg-muted/30">
            <div className="flex items-center gap-2 font-semibold">
              <SparklesIcon className="h-5 w-5 text-primary" />
              AI Product Detection
            </div>

            <p className="text-sm text-muted-foreground">
              Upload product image and AI will automatically detect product
              information.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleAIUpload(e.target.files[0])}
            />
 {aiLoading && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your product image...
                </p>
              </div>
            )}
            {aiPreview && (
              <img
                src={aiPreview}
                className="h-40 rounded-md border object-cover"
              />
            )}

           
          </section>
        )}

        {/* FORM */}

        {(mode === "manual" || aiFilled) && (
          <form action={action} className="space-y-10" noValidate>
            {/* BASIC INFO */}

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <Separator className="mt-2" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="Product Name"
                  name="name"
                  required
                  defaultValue={formValues.name}
                  error={state.errors?.name}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <CategorySelect
                    categories={categories}
                    value={category}
                    onChange={setCategory}
                    error={state.errors?.category}
                  />

                  <input type="hidden" name="category" value={category} />
                </div>
              </div>

              <FormInput
                label="Model"
                name="sku"
                defaultValue={formValues.sku}
                  error={state.errors?.sku}

              />

              <FormInput
                label="Description"
                name="description"
                textarea
                defaultValue={formValues.description}
              />
            </section>

            {/* PRICING */}

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Pricing</h2>
                <Separator className="mt-2" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="Regular Price"
                  name="regular_price"
                  type="number"
                  required
                  error={state.errors?.regular_price}
                />

                <FormInput
                  label="Sale Price"
                  name="sale_price"
                  type="number"
                />
              </div>
            </section>

            {/* PRODUCT IMAGES */}

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Product Images</h2>
                <Separator className="mt-2" />
              </div>

              <UploadImage
                uploadType="productImage"
                onSuccess={(urls) => {
                  setImages((prev) => [
                    ...prev,
                    ...urls.map((url) => ({
                      url,
                      is_default: prev.length === 0,
                    })),
                  ]);
                }}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`relative rounded-md overflow-hidden border cursor-pointer transition
                      ${
                        img.is_default
                          ? "ring-2 ring-primary"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() =>
                        setImages((prev) =>
                          prev.map((p, i) => ({
                            ...p,
                            is_default: i === index,
                          }))
                        )
                      }
                    >
                      <img
                        src={img.url}
                        className="h-32 w-full object-cover"
                      />

                      {img.is_default && (
                        <span className="absolute bottom-2 left-2 text-xs bg-primary text-white px-2 py-1 rounded">
                          Primary
                        </span>
                      )}

                      <button
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="hidden"
                name="images"
                value={JSON.stringify(images)}
              />
            </section>

            {/* SEO */}

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">SEO Metadata</h2>
                <Separator className="mt-2" />
              </div>

              <FormInput
                label="Meta Title"
                name="meta_title"
                required
                defaultValue={formValues.meta_title}
              />

              <FormInput
                label="Meta Description"
                name="meta_description"
                textarea
                required
                defaultValue={formValues.meta_description}
              />

              <FormInput
                label="Focus Keyword"
                name="focus_keyword"
                required
                defaultValue={formValues.focus_keyword}
              />
            </section>

            {/* SUBMIT */}

            <div className="pt-4 border-t flex justify-end">
              <Button disabled={pending}>
                {pending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}