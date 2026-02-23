import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Next.js + Supabase</h1>
        <p className="text-gray-500 mb-8">Assignment #3 — Google OAuth + Protected Routes</p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go to Dashboard →
        </Link>
      </div>
    </main>
  );
}
