"use client";
import { createClient } from "@/utils/supabase/client";
export default function LoginPage() {
  const supabase = createClient();
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="text-4xl">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-500 text-sm text-center">Sign in to access your dashboard.</p>
        <button onClick={signInWithGoogle} className="flex items-center gap-3 w-full justify-center bg-white border border-gray-300 rounded-lg px-5 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
