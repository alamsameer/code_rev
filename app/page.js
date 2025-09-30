// "use client";

// import ProtectedRoute from "../components/ProtectedRoute";
// import { useRouter } from "next/navigation";

// export default function Dashboard() {
//   const router = useRouter();

//   return (
//     <ProtectedRoute>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard!</h1>

//         <div className="flex gap-6">
//           {/* Questions Card */}
//           <div
//             className="cursor-pointer w-48 p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
//             onClick={() => router.push("/questions")}
//           >
//             <h2 className="text-xl font-semibold mb-2">Questions</h2>
//             <p className="text-gray-600">View and manage all questions</p>
//           </div>

//           {/* Categories Card */}
//           <div
//             className="cursor-pointer w-48 p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
//             onClick={() => router.push("/categories")}
//           >
//             <h2 className="text-xl font-semibold mb-2">Categories</h2>
//             <p className="text-gray-600">View and manage all categories</p>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Grid3x3, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-neutral-100">
        {/* Sidebar */}
        <aside className="w-16 bg-neutral-800 flex flex-col items-center py-6 gap-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Grid3x3 className="w-6 h-6 text-neutral-900" />
          </div>
          <nav className="flex flex-col gap-6">
            <button
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition"
              onClick={() => router.push("/questions")}
            >
              <Grid3x3 className="w-6 h-6" />
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition"
              onClick={() => router.push("/categories")}
            >
              <FileText className="w-6 h-6" />
            </button>
          </nav>
          <div className="mt-auto">
            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-neutral-500 text-sm mb-1">Welcome to</p>
              <h1 className="text-3xl font-bold">
                Learn<span className="text-orange-500">ify</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* <Avatar className="w-10 h-10">
                  {/* <AvatarImage src="/placeholder-user.jpg" /> */}
                  {/* <AvatarFallback>KV</AvatarFallback> */}
                {/* </Avatar>  */}
                <div className="text-sm">
                  <p className="font-semibold">Kacie Velasquez</p>
                  <p className="text-neutral-500 text-xs">@k_velasquez</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="cursor-pointer bg-white rounded-3xl p-6 shadow hover:shadow-lg transition text-center"
              onClick={() => router.push("/questions")}
            >
              <h2 className="text-xl font-semibold mb-2">Questions</h2>
              <p className="text-gray-600">View and manage all questions</p>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                Go to Questions
              </Button>
            </div>

            <div
              className="cursor-pointer bg-white rounded-3xl p-6 shadow hover:shadow-lg transition text-center"
              onClick={() => router.push("/categories")}
            >
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              <p className="text-gray-600">View and manage all categories</p>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                Go to Categories
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
