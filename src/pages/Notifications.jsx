import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Textarea } from "@/components/ui/textarea";
import { Bell, ArrowLeft, CheckCheck, Trash2, Shield, ShoppingBag, Zap, AlertTriangle, Settings, ThumbsUp, ThumbsDown, Lightbulb, Send, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TYPE_META = {
  info:            { color: "text-blue-300",   icon: Bell,          bg: "bg-blue-400/15"  },
  report:          { color: "text-red-400",     icon: AlertTriangle, bg: "bg-red-400/15"   },
  admin:           { color: "text-orange-400",  icon: Shield,        bg: "bg-orange-400/15" },
  listing_rejected:{ color: "text-red-400",     icon: ShoppingBag,   bg: "bg-red-400/15"   },
  message:         { color: "text-green-400",   icon: Bell,          bg: "bg-green-400/15"  },
  marketplace:     { color: "text-blue-400",    icon: ShoppingBag,   bg: "bg-blue-400/15"   },
  promotions:      { color: "text-yellow-400",  icon: Zap,           bg: "bg-yellow-400/15" },
  safety_alert:    { color: "text-red-400",     icon: AlertTriangle, bg: "bg-red-400/15"   },
  system_update:   { color: "text-purple-400",  icon: Settings,      bg: "bg-purple-400/15" },
};

const SUGGESTION_CATEGORIES = ["UI / Design","New Feature","Bug Report","Performance","Chat","Listings","Notifications","Other"];

export default function Notifications() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("notifications");
  const [sugCategory, setSugCategory] = useState("");
  const [sugMessage, setSugMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["notifications", user.id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const markRead = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteNotif = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("notifications").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const setReaction = useMutation({
    mutationFn: async ({ id, reaction, current }) => {
      const next = current === reaction ? null : reaction;
      const { error } = await supabase.from("notifications").update({ reaction: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n =>
      supabase.from("notifications").update({ is_read: true }).eq("id", n.id)
    ));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleSuggest = async () => {
    if (!sugCategory) { toast.error("Please select a category"); return; }
    if (sugMessage.trim().length < 10) { toast.error("Please write a bit more detail"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("suggestions").insert({
        user_id: user.id,
        username: profile?.username || "Anonymous",
        category: sugCategory,
        message: sugMessage.trim(),
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

  const filtered = notifications.filter(n =>
    filter === "all" ? true : (n.type === filter || n.category === filter)
  );
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        {activeTab === "notifications" ? <Bell className="w-5 h-5 text-orange-400" /> : <Lightbulb className="w-5 h-5 text-orange-400" />}
        <h1 className="text-lg font-heading font-bold flex-1">{activeTab === "notifications" ? "Notifications" : "Suggestions"}</h1>
        {activeTab === "notifications" && unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-orange-400 flex items-center gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all
          </button>
        )}
      </div>

      <div className="flex px-4 pt-3 gap-2">
        <button onClick={() => setActiveTab("notifications")}
          className={"flex-1 py-2 rounded-xl text-xs font-bold transition-all " + (activeTab === "notifications" ? "bg-orange-500/20 text-orange-400 border border-orange-400/30" : "glass text-muted-foreground")}>
          <Bell className="w-3.5 h-3.5 inline mr-1" />
          Notifications {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1.5">{unreadCount}</span>}
        </button>
        <button onClick={() => setActiveTab("suggestions")}
          className={"flex-1 py-2 rounded-xl text-xs font-bold transition-all " + (activeTab === "suggestions" ? "bg-orange-500/20 text-orange-400 border border-orange-400/30" : "glass text-muted-foreground")}>
          <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
          Suggestions
        </button>
      </div>

      {activeTab === "notifications" && (
        <div className="p-4 space-y-2 pb-24">
          {isLoading && Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton-glass" />)}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1 opacity-60">We will notify you about important updates</p>
            </div>
          )}
          {filtered.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.info;
            const IconComp = meta.icon;
            return (
              <GlassCard key={n.id}
                className={"p-3.5 flex items-start gap-3 cursor-pointer transition-all " + (!n.is_read ? "border-orange-400/25" : "")}
                onClick={() => !n.is_read && markRead.mutate(n.id)}>
                <div className={"w-9 h-9 rounded-xl flex items-center justify-center shrink-0 " + meta.bg}>
                  <IconComp className={"w-4 h-4 " + meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={"text-sm font-bold " + meta.color}>{n.title}</p>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      {n.image_url && <img src={n.image_url} alt="" className="mt-2 rounded-xl max-h-24 object-cover w-full" />}
                      <span className="text-[10px] text-muted-foreground/50">
                        {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "like", current: n.reaction }); }}
                        className={"p-1.5 rounded-lg transition-colors " + (n.reaction === "like" ? "text-green-400" : "hover:text-green-400 text-muted-foreground")}>
                        <ThumbsUp className="w-3.5 h-3.5" fill={n.reaction === "like" ? "currentColor" : "none"} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "dislike", current: n.reaction }); }}
                        className={"p-1.5 rounded-lg transition-colors " + (n.reaction === "dislike" ? "text-red-400" : "hover:text-red-400 text-muted-foreground")}>
                        <ThumbsDown className="w-3.5 h-3.5" fill={n.reaction === "dislike" ? "currentColor" : "none"} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                        className="p-1.5 rounded-lg hover:text-red-400/70 text-muted-foreground">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {activeTab === "suggestions" && (
        <div className="p-4 space-y-4 pb-24">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
              <p className="text-lg font-bold text-foreground">Thanks for your feedback!</p>
              <p className="text-sm text-muted-foreground">We read every suggestion and use them to improve FutaMart.</p>
              <GlassButton variant="orange" onClick={() => { setSubmitted(false); setSugCategory(""); setSugMessage(""); }} className="mt-2">Send Another</GlassButton>
            </div>
          ) : (
            <>
              <GlassCard className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">What is your suggestion about?</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_CATEGORIES.map(c => (
                    <button key={c} onClick={() => setSugCategory(c)}
                      className={"px-3 py-1.5 rounded-full text-xs font-semibold transition-all " + (sugCategory === c ? "bg-orange-500/30 text-orange-400 border border-orange-400/40" : "glass text-muted-foreground")}>
                      {c}
                    </button>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Describe your suggestion</p>
                <Textarea
                  value={sugMessage}
                  onChange={e => setSugMessage(e.target.value)}
                  placeholder="Tell us what you would like to see improved or added..."
                  className="bg-transparent border-white/10 resize-none text-sm min-h-[140px]"
                  maxLength={500}
                />
                <p className="text-[10px] text-muted-foreground text-right">{sugMessage.length}/500</p>
              </GlassCard>
              <GlassButton variant="orange" className="w-full" onClick={handleSuggest} disabled={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Sending..." : "Send Suggestion"}
              </GlassButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
