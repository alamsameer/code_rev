"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddQuestionModal from "../../components/AddQuestionModal";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: "", topic: "", tag: "" });
  const [showModal, setShowModal] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [revisionPlan, setRevisionPlan] = useState({
    level1: 1,
    level2: 2,
    level3: 3,
    level4: 4,
    level5: 5,
  });
  const [activeTab, setActiveTab] = useState("today"); // "today" | "all"

  // Fetch settings (revision plan)
  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("revision_plan").single();
    if (data?.revision_plan) setRevisionPlan(data.revision_plan);
  };

  const fetchQuestions = async () => {
    let query = supabase
      .from("questions")
      .select(`
        id,
        title,
        description,
        topic,
        tags,
        category_id,
        categories(name),
        next_revision_date,
        confidence_level,
        revision_step,
        link
      `);

    if (filters.category) query = query.eq("category_id", filters.category);
    if (filters.topic) query = query.ilike("topic", `%${filters.topic}%`);
    if (filters.tag) query = query.contains("tags", [filters.tag]);

    const { data, error } = await query.order("next_revision_date", { ascending: true });
    if (error) console.log(error);
    else setQuestions(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
    fetchSettings();
  }, [filters]);

  // Mark question complete with confidence
  const handleRevisionComplete = async (confidence) => {
    if (!selectedQuestion) return;

    const today = new Date();
    const daysToAdd = revisionPlan[`level${confidence}`] || confidence;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);

    // Determine next revision step
    const currentStep = parseInt(selectedQuestion.revision_step?.replace("R", "") || 1);
    const nextStep = currentStep < 5 ? `R${currentStep + 1}` : "R5";

    const { error } = await supabase
      .from("questions")
      .update({
        confidence_level: confidence,
        next_revision_date: nextDate.toISOString().split("T")[0],
        revision_step: nextStep,
      })
      .eq("id", selectedQuestion.id);

    if (error) console.error(error);

    setShowConfidenceModal(false);
    setSelectedQuestion(null);
    fetchQuestions();
  };

  // Filter for Today tab
  const todayQuestions = questions.filter((q) => {
    if (!q.next_revision_date) return false;
    const today = new Date().toISOString().split("T")[0];
    return q.next_revision_date <= today;
  });

  const displayedQuestions = activeTab === "today" ? todayQuestions : questions;

  return (
    <div className="p-6 bg-[#EBEBEB] min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#EF7722]">Questions</h1>
        <button
          className="px-5 py-2 bg-[#EF7722] text-white rounded-lg shadow hover:bg-[#FAA533] transition"
          onClick={() => setShowModal(true)}
        >
          + Add Question
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg shadow ${
            activeTab === "today" ? "bg-[#EF7722] text-white" : "bg-white text-black"
          }`}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
        <button
          className={`px-4 py-2 rounded-lg shadow ${
            activeTab === "all" ? "bg-[#EF7722] text-white" : "bg-white text-black"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
      </div>

      {/* Filters (only show on All tab) */}
      {activeTab === "all" && (
        <div className="flex gap-4 mb-6">
          <select
            className="border p-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Topic"
            className="border p-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black"
            value={filters.topic}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          />

          <input
            type="text"
            placeholder="Tag"
            className="border p-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          />
        </div>
      )}

      {/* Questions Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-300 bg-white text-black">
          <thead className="bg-[#FAA533] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Question</th>
              <th className="px-4 py-2 text-left">Topic</th>
              <th className="px-4 py-2 text-left">Tags</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Next Revision</th>
              <th className="px-4 py-2 text-left">Confidence</th>
              <th className="px-4 py-2 text-left">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedQuestions.map((q) => (
              <tr
                key={q.id}
                className="hover:bg-[#EF7722]/10 cursor-pointer transition text-black"
                onClick={() => {
                  setSelectedQuestion(q);
                  setShowConfidenceModal(true);
                }}
              >
                <td className="px-4 py-2">{q.title}</td>
                <td className="px-4 py-2">{q.topic}</td>
                <td className="px-4 py-2">{q.tags.join(", ")}</td>
                <td className="px-4 py-2">{q.categories?.name}</td>
                <td className="px-4 py-2">{q.next_revision_date}</td>
                <td className="px-4 py-2">
                  {q.revision_step}: {"⭐".repeat(q.confidence_level || 0)}
                </td>
                <td className="px-4 py-2">
                  {q.link && (
                    <a
                      href={q.link}
                      target="_blank"
                      className="text-[#0BA6DF] hover:underline"
                    >
                      Link
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confidence Modal */}
      {showConfidenceModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4">Select Confidence</h2>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  className="px-3 py-2 bg-[#EF7722] text-white rounded-lg hover:bg-[#FAA533] transition"
                  onClick={() => handleRevisionComplete(level)}
                >
                  {level} ⭐
                </button>
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition w-full"
              onClick={() => setShowConfidenceModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <AddQuestionModal
          onClose={() => {
            setShowModal(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
