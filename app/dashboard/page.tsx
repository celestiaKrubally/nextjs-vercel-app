import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";
import VoteButton from "./VoteButton";
import ImageUploader from "./ImageUploader";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: captions, error } = await supabase
        .from("captions")
        .select("id, content, like_count")
        .limit(20);

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">🎬 Caption Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{user.user_metadata?.full_name ?? user.email}</span>
                    <SignOutButton />
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-10">
                <ImageUploader />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Captions</h2>
                <p className="text-gray-500 text-sm mb-6">Vote on captions below</p>

                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">{error.message}</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {captions?.map((caption) => (
                            <div key={caption.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4">
                                <p className="text-gray-700 text-sm flex-1">{caption.content}</p>
                                <VoteButton captionId={caption.id} profileId={user.id} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}