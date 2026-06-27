import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Lightbulb, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "UI / Design",
  "New Feature",
  "Bug Report",
  "Performance",
  "Chat",
  "Listings",
  "Notifications",
  "Other",
];

export default function Suggestions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!category) { toast.error("Please select a category"); return; }
    if (message.trim().length < 10) { toast.error("Please write a bit more detail"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("suggestions").insert({
        user_id: user.id,
        username: profile?.username || "Anonymous",
        category,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error("Failed to send — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <Lightbulb className="w-5 h-5 text-orange-400" />
        <h1 className="text-lg font-display font-bold">Send a Suggestion</h1>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
            <p className="text-lg font-bold text-foreground">Thanks for your feedback!</p>
            <p className="text-sm text-muted-foreground">We read every suggestion and use them to improve FutaMart.</p>
            <GlassButton variant="orange" onClick={() => navigate(-1)} className="mt-2">Go Back</GlassButton>
          </div>
        ) : (
          <>
            <GlassCard className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">What is your suggestion about?</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={"px-3 py-1.5 rounded-full text-xs font-semibold transition-all " + (category === c ? "bg-orange-500/30 text-orange-400 border border-orange-400/40" : "glass text-muted-foreground")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">Describe your suggestion</p>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what you'd like to see improved or added..."
                className="bg-transparent border-white/10 resize-none text-sm min-h-[140px]"
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground text-right">{message.length}/500</p>
            </GlassCard>

            <GlassButton
              variant="orange"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Sending..." : "Send Suggestion"}
            </GlassButton>
          </>
        )}
      </div>
    </div>
  );
}
