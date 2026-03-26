"use client";

import { useState } from "react";

export default function AddCategory({ categories }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    meta_title: "",
    meta_description: "",
    focus_keyword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("/admin/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug:
          form.slug ||
          form.name.toLowerCase().replace(/\s+/g, "-"),
      }),
    });

    if (res.ok) {
      alert("Category added successfully");
      setForm({
        name: "",
        slug: "",
        parent_id: "",
        description: "",
        meta_title: "",
        meta_description: "",
        focus_keyword: "",
      });
    } else {
      alert("Failed to add category");
    }
  };

  return (
    <div className="rounded border border-gray-200 bg-white p-6 shadow-sm m-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        Add Category
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="Category Name"
          className="input p-2 border border-gray-300 rounded w-full"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="slug"
          placeholder="Slug (optional)"
          className="input p-2 border border-gray-300 rounded w-full"
          value={form.slug}
          onChange={handleChange}
        />

        <select
          name="parent_id"
          className="input md:col-span-2"
          value={form.parent_id}
          onChange={handleChange}
        >
          <option value="">No Parent (Root Category)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.path}
            </option>
          ))}
        </select>

        <textarea
          name="description"
          placeholder="Description"
          className="input h-24 resize-none border border-gray-300 rounded w-full"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="meta_title"
          placeholder="Meta Title"
          className="input p-2 border border-gray-300 rounded w-full"
          value={form.meta_title}
          onChange={handleChange}
        />

        <input
          name="focus_keyword"
          placeholder="Focus Keyword"
          className="input p-2 border border-gray-300 rounded w-full"
          value={form.focus_keyword}
          onChange={handleChange}
        />

        <textarea
          name="meta_description"
          placeholder="Meta Description"
          className="input h-24 resize-none border border-gray-300 rounded w-full"
          value={form.meta_description}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Save Category
      </button>
    </div>
  );
}
