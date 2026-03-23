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

  // Insert or update vote — now includes required schema fields
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
}