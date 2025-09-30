"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddQuestionModal from "../../components/AddQuestionModal";
import { Search, Bell, Grid3x3, FileText, Bookmark, Headphones, Settings, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const handleRevisionComplete = async (confidence) => {
    if (!selectedQuestion) return;

    const today = new Date();
    const daysToAdd = revisionPlan[`level${confidence}`] || confidence;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);

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

  const todayQuestions = questions.filter((q) => {
    if (!q.next_revision_date) return false;
    const today = new Date().toISOString().split("T")[0];
    return q.next_revision_date <= today;
  });

  const displayedQuestions = activeTab === "today" ? todayQuestions : questions;

  return (
    <>
          <div className="flex min-h-screen bg-neutral-100">
        {/* Sidebar */}
        {/* <aside className="w-16 bg-neutral-800 flex flex-col items-center py-6 gap-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Grid3x3 className="w-6 h-6 text-neutral-900" />
          </div>
          <nav className="flex flex-col gap-6">
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <Grid3x3 className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-orange-500 transition">
              <HelpCircle className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <FileText className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <Bookmark className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <Headphones className="w-6 h-6" />
            </button>
          </nav>
          <div className="mt-auto">
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </aside> */}

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          {/* <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-neutral-500 text-sm mb-1">Welcome to</p>
              <h1 className="text-3xl font-bold">
                Learn<span className="text-orange-500">ify</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-64 pl-4 pr-12 py-2 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
              <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 transition">
                <Bell className="w-5 h-5 text-neutral-700" />
              </button>
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>KV</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold">Kacie Velasquez</p>
                  <p className="text-neutral-500 text-xs">@k_velasquez</p>
                </div>
              </div>
            </div>
          </header> */}

          {/* Page Title and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-neutral-900">Questions</h2>
            <button
              className="px-6 py-2.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition font-semibold"
              onClick={() => setShowModal(true)}
            >
              + Add Question
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              className={`px-6 py-2.5 rounded-full shadow-lg font-semibold transition ${
                activeTab === "today" ? "bg-orange-500 text-white" : "bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
              onClick={() => setActiveTab("today")}
            >
              Today ({todayQuestions.length})
            </button>
            <button
              className={`px-6 py-2.5 rounded-full shadow-lg font-semibold transition ${
                activeTab === "all" ? "bg-orange-500 text-white" : "bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All ({questions.length})
            </button>
          </div>

          {/* Filters (All tab) */}
          {activeTab === "all" && (
            <div className="flex gap-4 mb-6">
              <select
                className="border border-neutral-300 px-4 py-2.5 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 bg-white font-medium"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filter by topic"
                className="border border-neutral-300 px-4 py-2.5 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 bg-white"
                value={filters.topic}
                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              />

              <input
                type="text"
                placeholder="Filter by tag"
                className="border border-neutral-300 px-4 py-2.5 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 bg-white"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              />
            </div>
          )}

          {/* Questions Table */}
          <div className="overflow-x-auto rounded-3xl shadow-lg bg-white">
            <table className="min-w-full">
              <thead className="bg-neutral-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Question</th>
                  <th className="px-6 py-4 text-left font-semibold">Topic</th>
                  <th className="px-6 py-4 text-left font-semibold">Tags</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Next Revision</th>
                  <th className="px-6 py-4 text-left font-semibold">Confidence</th>
                  <th className="px-6 py-4 text-left font-semibold">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {displayedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                      No questions found. {activeTab === "today" ? "Add some questions to get started!" : "Try adjusting your filters."}
                    </td>
                  </tr>
                ) : (
                  displayedQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-orange-50 cursor-pointer transition text-neutral-900"
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowConfidenceModal(true);
                      }}
                    >
                      <td className="px-6 py-4 font-medium">{q.title}</td>
                      <td className="px-6 py-4">{q.topic}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {q.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-300 text-neutral-900 rounded-full text-sm font-semibold">
                          {q.categories?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">{q.next_revision_date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-700">{q.revision_step}:</span>
                          <span className="text-yellow-500">{"⭐".repeat(q.confidence_level || 0)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {q.link && (
                          <a
                            href={q.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 font-semibold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Confidence Modal */}
      {showConfidenceModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
            <h2 className="text-2xl font-bold mb-2 text-neutral-900">Rate Your Confidence</h2>
            <p className="text-neutral-600 mb-6 text-sm">How well do you know this question?</p>
            <div className="flex gap-3 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  className="w-14 h-14 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-bold text-lg shadow-lg hover:scale-110 transform"
                  onClick={() => handleRevisionComplete(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="text-xs text-neutral-500 text-center mb-6">1 = Need to review soon • 5 = Know it well</div>
            <button
              className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-full hover:bg-neutral-300 transition w-full font-semibold"
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
    </>
  );
}
