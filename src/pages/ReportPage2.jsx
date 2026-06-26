import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Flag, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  "Fake or scam listing",
  "Inappropriate content",
  "Wrong category",
  "Duplicate listing",
  "Offensive language",
  "Other",
];

export default function ReportPage2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const type = params.get("type");
  const id = params.get("id");
  const name = params.get("name");

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: type,
        target_id: id,
        target_name: name,
        reason,
        details,
      });
      if (error) throw error;

      // Notify the reported user
      const notifUserId = type === "listing"
        ? (await supabase.from("listings").select("seller_id").eq("id", id).maybeSingle()).data?.seller_id
        : id;

      if (notifUserId && notifUserId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: notifUserId,
          title: type === "listing" ? "Your listing has been reported" : "Your profile has been reported",
          message: type === "listing"
            ? `Your listing "${decodeURIComponent(name || "")}" was reported for: ${reason}. Please review our community guidelines.`
            : `Your seller profile was reported for: ${reason}. Please review our community guidelines.`,
          type: "admin",
          category: "admin",
          from_name: "FutaMart Team",
          is_read: false,
        });
      }
    },
    onSuccess: () => setDone(true),
    onError: () => toast.error("Failed to submit report"),
  });

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <CheckCircle className="w-14 h-14 text-green-400" />
      <p className="text-lg font-bold">Report Submitted</p>
      <p className="text-sm text-muted-foreground">Thanks for keeping FutaMart safe. We will review this shortly.</p>
      <button onClick={() => navigate(-1)}
        className="mt-2 px-6 py-2 rounded-xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#FF6B00,#FFB000)" }}>
        Go Back
      </button>
    </div>
  );

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display font-bold flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-400" /> Report {type === "listing" ? "Listing" : "Seller"}
        </h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="glass rounded-xl p-3 text-sm text-muted-foreground">
          Reporting: <span className="text-foreground font-medium">{decodeURIComponent(name || "")}</span>
        </div>
        <p className="text-sm font-semibold">Select a reason</p>
        <div className="space-y-2">
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${reason === r ? "border-orange-500 bg-orange-500/10 text-orange-400 font-medium" : "border-white/10 bg-white/5 text-muted-foreground"}`}>
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm resize-none focus:outline-none focus:border-orange-400"
          style={{ WebkitUserSelect: "text", userSelect: "text" }}
        />
        <button
          onClick={() => submit.mutate()}
          disabled={!reason || submit.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#FF6B00,#FFB000)" }}>
          {submit.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
