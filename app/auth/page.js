"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const handleSignup = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Signup error:", error);
      setMessage(error.message);
      return;
    }

    console.log("Signup data:", data);
    setMessage("Signup successful! Please check your email to confirm.");

    // Optional: Initialize settings for new user
    if (data.user) {
      await supabase.from("settings").insert({
        user_id: data.user.id,
        revision_plan: { level1: 1, level2: 2, level3: 3, level4: 4, level5: 5 }
      });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    setMessage("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Login successful!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Signup</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex justify-between">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Signup
          </button>
        </div>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
