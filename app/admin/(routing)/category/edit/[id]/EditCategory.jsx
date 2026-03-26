"use client";

import { useState, useMemo } from "react";
import { updateCategory } from "./action";
import { useRouter } from "next/navigation";

export default function EditCategory({ category, categories }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    parent_id: category.parent_id || "",
    description: category.description || "",
    meta_title: category.seo?.meta_title || "",
    meta_description: category.seo?.meta_description || "",
    focus_keyword: category.seo?.focus_keyword || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔍 Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        cat.id !== category.id &&
        cat.path.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, categories, category.id]);

  const handleSubmit = async () => {
    const res = await updateCategory(category.id, {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
    });

    if (res.success) {
      alert("✅ Category updated successfully");
      router.push("/admin/category");
    } else {
      alert(res.message || "❌ Update failed");
    }
  };

  return (
    <div className="m-2 rounded-lg border border-gray-200 bg-white  shadow-sm">
      {/* ================= HEADER ================= */}
      <div className="mb-6 border-b border-gray-200 p-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit Category</h2>
      
      </div>

      {/* ================= BASIC INFO ================= */}
      <div className="mb-8 px-6 ">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              name="name"
              placeholder="e.g. Electronics"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              name="slug"
              placeholder="e.g. electronics"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              value={form.slug}
              onChange={handleChange}
            />
          </div>

          {/* PARENT */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Parent Category
            </label>

            {/* 🔍 Search */}
            <input
              placeholder="Search parent category..."
              className="mb-2 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              name="parent_id"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              value={form.parent_id || ""}
              onChange={handleChange}
            >
              <option value="">No Parent (Root Category)</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.path}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Short description about this category..."
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
<hr className="border-gray-200"/>
      {/* ================= SEO META INFO ================= */}
      <div className="  p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
          SEO Meta Data
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* META TITLE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              name="meta_title"
              placeholder="SEO title for search engines"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
              value={form.meta_title}
              onChange={handleChange}
            />
          </div>

          {/* FOCUS KEYWORD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Focus Keyword
            </label>
            <input
              name="focus_keyword"
              placeholder="e.g. buy electronics online"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
              value={form.focus_keyword}
              onChange={handleChange}
            />
          </div>

          {/* META DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              placeholder="SEO description shown in search results..."
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
              value={form.meta_description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center justify-start gap-3 border-t border-gray-200 pt-4 p-6">
        <button
          onClick={handleSubmit}
          className="rounded-md  bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Update Category
        </button>
      </div>
    </div>
  );
}
