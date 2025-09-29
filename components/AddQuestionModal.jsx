"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddQuestionModal({ onClose }) {
  const [jsonInput, setJsonInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data);
    };
    fetchCategories();
  }, []);

const handleSubmit = async () => {
  try {
    const questions = JSON.parse(jsonInput);

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      setError("User not authenticated");
      return;
    }
    const userId = user.data.user.id;

    // Validate categories and build a map for faster lookup
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.name] = c.id;
    });

    for (const q of questions) {
      if (!categoryMap[q.category]) {
        setError(`Category "${q.category}" does not exist. Please create it first.`);
        return;
      }
    }

    // Prepare all rows to insert
    const rowsToInsert = questions.map((q) => ({
      title: q.title,
      description: q.description || "",
      topic: q.topic,
      tags: q.tags || [],
      category_id: categoryMap[q.category],
      link: q.link || "",
      next_revision_date: new Date(),
      revision_step: "1",
      confidence_level: null,
      user_id: userId // <-- required if RLS is enabled
    }));

    // Bulk insert
    const { data, error } = await supabase.from("questions").insert(rowsToInsert);

    if (error) {
      console.error("Error inserting questions:", error);
      setError("Failed to insert questions");
      return;
    }

    onClose();
  } catch (err) {
    console.error(err);
    setError("Invalid JSON format");
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#EBEBEB] p-6 rounded-lg w-96 shadow-lg text-black">
        <h2 className="text-2xl font-bold mb-4">Add Questions (JSON)</h2>
        <textarea
          className="w-full h-40 border p-2 rounded shadow mb-2 focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black"
          placeholder='[{"title":"Two Sum","topic":"Arrays","tags":["easy"],"category":"DSA","link":"https://leetcode.com/problems/two-sum/"}]'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAA533] text-black rounded shadow hover:bg-[#EF7722] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#EF7722] text-black rounded shadow hover:bg-[#FAA533] transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
