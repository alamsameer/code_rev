"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddQuestionModal({ onClose }) {
  const [jsonInput, setJsonInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [useJson, setUseJson] = useState(false); // toggle between JSON and form
  const [formQuestions, setFormQuestions] = useState([
    { title: "", topic: "", tags: "", category: "", link: "" },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleFormChange = (index, field, value) => {
    const updated = [...formQuestions];
    updated[index][field] = value;
    setFormQuestions(updated);
  };

  const addFormQuestion = () => {
    setFormQuestions([...formQuestions, { title: "", topic: "", tags: "", category: "", link: "" }]);
  };

  const handleSubmit = async () => {
    try {
      const questions = useJson
        ? JSON.parse(jsonInput)
        : formQuestions.map((q) => ({
            ...q,
            tags: q.tags ? q.tags.split(",").map((t) => t.trim()) : [],
          }));
          console.log(questions);
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        setError("User not authenticated");
        return;
      }
      const userId = user.data.user.id;

      // Mandatory field check for form input
      if (!useJson) {
        for (const [i, q] of questions.entries()) {
          if (!q.title || !q.topic || !q.category) {
            setError(`Question ${i + 1}: Title, Topic, and Category are required.`);
            return;
          }
        }
      }

      // Validate categories
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

      // Prepare rows for insertion
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
        user_id: userId,
      }));

      const { error: insertError } = await supabase.from("questions").insert(rowsToInsert);

      if (insertError) {
        console.error("Error inserting questions:", insertError);
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
      <div className="bg-[#EBEBEB] p-6 rounded-lg w-11/12 max-w-2xl shadow-lg text-black overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Add Questions</h2>

        {/* Toggle between JSON and Form */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${!useJson ? "bg-[#EF7722] text-black" : "bg-gray-300 text-black"}`}
            onClick={() => setUseJson(false)}
          >
            Form Input
          </button>
          <button
            className={`px-4 py-2 rounded ${useJson ? "bg-[#EF7722] text-black" : "bg-gray-300 text-black"}`}
            onClick={() => setUseJson(true)}
          >
            JSON Input
          </button>
        </div>

        {useJson ? (
          <textarea
            className="w-full h-40 border p-2 rounded shadow mb-2 focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black"
            placeholder='[{"title":"Two Sum","topic":"Arrays","tags":["easy"],"category":"DSA","link":"https://leetcode.com/problems/two-sum/"}]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        ) : (
          <>
            {formQuestions.map((q, idx) => (
              <div key={idx} className="border p-4 mb-2 rounded bg-white shadow">
                <input
                  className={`w-full mb-2 p-2 border rounded ${!q.title && error ? "border-red-500" : ""}`}
                  placeholder="Title *"
                  value={q.title}
                  onChange={(e) => handleFormChange(idx, "title", e.target.value)}
                />
                <input
                  className={`w-full mb-2 p-2 border rounded ${!q.topic && error ? "border-red-500" : ""}`}
                  placeholder="Topic *"
                  value={q.topic}
                  onChange={(e) => handleFormChange(idx, "topic", e.target.value)}
                />
                <input
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Tags (comma separated)"
                  value={q.tags}
                  onChange={(e) => handleFormChange(idx, "tags", e.target.value)}
                />
                <select
                  className={`w-full mb-2 p-2 border rounded ${!q.category && error ? "border-red-500" : ""}`}
                  value={q.category}
                  onChange={(e) => handleFormChange(idx, "category", e.target.value)}
                >
                  <option value="">Category *</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Link"
                  value={q.link}
                  onChange={(e) => handleFormChange(idx, "link", e.target.value)}
                />
              </div>
            ))}
            <button
              className="px-4 py-2 bg-[#FAA533] text-black rounded shadow hover:bg-[#EF7722] transition mb-4"
              onClick={addFormQuestion}
            >
              Add Another Question
            </button>
          </>
        )}

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
