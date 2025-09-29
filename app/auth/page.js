"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // 🔹 Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.push("/questions");
      }
    };

    checkSession();
  }, [router]);

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
      setMessage("Signup successful! Redirecting...");

      if (data.user) {
        await supabase.from("settings").insert({
          user_id: data.user.id,
          revision_plan: {
            level1: 1,
            level2: 2,
            level3: 3,
            level4: 4,
            level5: 5,
          },
        });
      }

      router.push("/questions");
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful! Redirecting...");
      router.push("/questions");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBEBEB]">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-black">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#EF7722]">
          Login / Signup
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black placeholder-gray-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-[#EF7722] text-black placeholder-gray-500"
        />

        <div className="flex justify-between">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-[#EF7722] text-black font-semibold rounded shadow hover:bg-[#FAA533] transition"
          >
            Login
          </button>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="px-4 py-2 bg-[#0BA6DF] text-black font-semibold rounded shadow hover:bg-[#FAA533] transition"
          >
            Signup
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-[#EF7722]">{message}</p>
        )}
      </div>
    </div>
  );
}
