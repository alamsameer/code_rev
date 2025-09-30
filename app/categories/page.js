"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";

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

    const user = supabase.auth.getUser();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: newCategory,
        user_id: (await user).data.user.id
      });

    if (error) console.error("Error adding category:", error);
    else {
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
    await supabase.from("settings").upsert({ revision_plan }).eq("id", 1);
    setMessage("Revision plan updated!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-8 bg-neutral-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">
        Manage <span className="text-orange-500">Categories</span>
      </h1>

      {/* Add Category */}
      <div className="bg-white rounded-3xl p-6 shadow mb-6 flex gap-3 items-center">
        <Input
          type="text"
          placeholder="Enter category name"
          className="flex-1 rounded-full border-neutral-300"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <Button onClick={addCategory} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-3xl p-6 shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Your Categories</h2>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No categories yet. Add your first category above!</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 hover:border-orange-300 transition">
                <div className="flex-1">
                  {editingCategory === cat.id ? (
                    <Input
                      type="text"
                      className="rounded-full border-neutral-300"
                      defaultValue={cat.name}
                      onBlur={(e) => updateCategory(cat.id, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id, e.currentTarget.value)}
                      autoFocus
                    />
                  ) : (
                    <Badge className="bg-neutral-900 text-white rounded-full px-4 py-1 hover:bg-neutral-800 cursor-pointer" onClick={() => setEditingCategory(cat.id)}>
                      {cat.name}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingCategory(cat.id)} variant="outline" size="sm" className="rounded-full border-neutral-300">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => deleteCategory(cat.id)} variant="outline" size="sm" className="rounded-full border-red-300 text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revision Plan */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Revision Plan Settings</h2>
        <p className="text-neutral-600 mb-6 text-sm">
          Configure how many days to wait before reviewing questions at each confidence level.
        </p>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Object.keys(revisionPlan).map((level) => (
            <div key={level} className="flex flex-col items-center">
              <label className="font-semibold text-sm mb-2 text-neutral-700">{level.replace("level", "Level ")}</label>
              <Input
                type="number"
                min={1}
                className="w-full text-center rounded-full border-neutral-300"
                value={revisionPlan[level]}
                onChange={(e) => setRevisionPlan({ ...revisionPlan, [level]: Number(e.target.value) })}
              />
              <span className="text-xs text-neutral-500 mt-1">days</span>
            </div>
          ))}
        </div>
        <Button onClick={updateRevisionPlan} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
          Update Revision Plan
        </Button>
        {message && <p className="text-green-600 mt-4 font-medium">{message}</p>}
      </div>
    </div>
  );
}
