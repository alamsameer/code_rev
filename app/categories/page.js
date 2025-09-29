"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [revisionPlan, setRevisionPlan] = useState({ level1: 1, level2: 2, level3: 3, level4: 4, level5: 5 });
  const [message, setMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.log(error);
    else setCategories(data);
  };

  // Fetch revision plan
  const fetchRevisionPlan = async () => {
    const { data } = await supabase.from("settings").select("revision_plan").single();
    if (data?.revision_plan) setRevisionPlan(data.revision_plan);
  };

  useEffect(() => {
    fetchCategories();
    fetchRevisionPlan();
  }, []);

  // Add category
const addCategory = async () => {
  if (!newCategory.trim()) return;

  const user = supabase.auth.getUser(); // Get current logged-in user

  // Insert with user_id matching the authenticated user
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: newCategory,
      user_id: (await user).data.user.id  // <-- set user_id
    });

  if (error) {
    console.error("Error adding category:", error);
  } else {
    setNewCategory("");
    fetchCategories();
  }
};


  // Update category
  const updateCategory = async (id, name) => {
    if (!name.trim()) return;
    await supabase.from("categories").update({ name }).eq("id", id);
    setEditingCategory(null);
    fetchCategories();
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
  };

  // Update revision plan
  const updateRevisionPlan = async () => {
    await supabase
      .from("settings")
      .upsert({ revision_plan })
      .eq("id", 1); // Assuming single settings row
    setMessage("Revision plan updated!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      {/* Add Category */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New Category"
          className="border p-2 rounded flex-1"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      {/* Categories Table */}
      <table className="min-w-full divide-y divide-gray-200 mb-6">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                {editingCategory === cat.id ? (
                  <input
                    type="text"
                    className="border p-1 rounded w-full"
                    defaultValue={cat.name}
                    onBlur={(e) => updateCategory(cat.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => setEditingCategory(cat.id)}
                  className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Revision Plan */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Revision Plan (Days per Level)</h2>
        <div className="flex gap-2">
          {Object.keys(revisionPlan).map((level) => (
            <div key={level} className="flex flex-col items-center">
              <label className="font-semibold">{level.toUpperCase()}</label>
              <input
                type="number"
                min={1}
                className="border p-1 w-16 rounded text-center"
                value={revisionPlan[level]}
                onChange={(e) =>
                  setRevisionPlan({ ...revisionPlan, [level]: Number(e.target.value) })
                }
              />
            </div>
          ))}
        </div>
        <button
          onClick={updateRevisionPlan}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update Revision Plan
        </button>
        {message && <p className="text-green-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
