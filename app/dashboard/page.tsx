import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: movies, error } = await supabase.from("movies").select("*").limit(20);
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">🎬 Movie Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.user_metadata?.full_name ?? user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Movies</h2>
        <p className="text-gray-500 text-sm mb-6">Data fetched live from Supabase</p>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">{error.message}</div>
        ) : !movies || movies.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-700">No movies found.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>{Object.keys(movies[0]).map((col) => <th key={col} className="px-5 py-3 font-semibold">{col}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {movies.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => <td key={j} className="px-5 py-3 text-gray-700">{String(val ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
