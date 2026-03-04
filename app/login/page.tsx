"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function LoginPage() {
  const supabase = createClient();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: "388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com",
        callback: async (response: { credential: string }) => {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });
          if (!error) window.location.href = "/dashboard";
        },
      });

      window.google.accounts.id.renderButton(
          document.getElementById("google-btn")!,
          { theme: "outline", size: "large", width: 300 }
      );
    };
  }, []);

  return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-sm w-full">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm text-center">Sign in to access your dashboard.</p>
          <div id="google-btn" />
        </div>
      </main>
  );
}