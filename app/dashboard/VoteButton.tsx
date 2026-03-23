"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function VoteButton({
  captionId,
  profileId,
}: {
  captionId: string;
  profileId: string;
}) {
  const [voted, setVoted] = useState<null | 1 | -1>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = async (voteValue: 1 | -1) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Toggle off — delete the row
    if (voted === voteValue) {
      await supabase
        .from("caption_votes")
        .delete()
        .match({ caption_id: captionId, profile_id: profileId });
      setVoted(null);
      setLoading(false);
      return;
    }

    // Insert or update vote
    const { error } = await supabase
      .from("caption_votes")
      .upsert(
        {
          caption_id: captionId,
          profile_id: profileId,
          vote_value: voteValue,
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
          created_datetime_utc: new Date().toISOString(),
          modified_datetime_utc: new Date().toISOString(),
        },
        { onConflict: "caption_id,profile_id" }
      );

    if (error) {
      setError(error.message);
    } else {
      setVoted(voteValue);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => submitVote(1)}
          disabled={loading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            voted === 1
              ? "bg-green-500 text-white"
              : "bg-gray-100 hover:bg-green-100 text-gray-700"
          } disabled:opacity-50`}
        >
          👍
        </button>
        <button
          onClick={() => submitVote(-1)}
          disabled={loading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            voted === -1
              ? "bg-red-500 text-white"
              : "bg-gray-100 hover:bg-red-100 text-gray-700"
          } disabled:opacity-50`}
        >
          👎
        </button>
      </div>
      {voted !== null && (
        <span className="text-xs text-gray-400">
          {voted === 1 ? "Upvoted!" : "Downvoted!"}
        </span>
      )}
      {loading && <span className="text-xs text-gray-400">Saving...</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}