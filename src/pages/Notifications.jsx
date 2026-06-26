import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Bell, ArrowLeft, CheckCheck, Trash2, Shield, ShoppingBag, Zap, AlertTriangle, Settings, ThumbsUp, ThumbsDown } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const TYPE_META = {
  info:            { color: "text-blue-300",   icon: Bell,          bg: "bg-blue-400/15"   },
  report:          { color: "text-red-400",     icon: AlertTriangle, bg: "bg-red-400/15"    },
  admin:           { color: "text-orange-400",  icon: Shield,        bg: "bg-orange-400/15" },
  listing_rejected:{ color: "text-red-400",     icon: ShoppingBag,   bg: "bg-red-400/15"    },
  message:         { color: "text-green-400",   icon: Bell,          bg: "bg-green-400/15"  },
  marketplace:     { color: "text-blue-400",    icon: ShoppingBag,   bg: "bg-blue-400/15"   },
  promotions:      { color: "text-yellow-400",  icon: Zap,           bg: "bg-yellow-400/15" },
  safety_alert:    { color: "text-red-400",     icon: AlertTriangle, bg: "bg-red-400/15"    },
  system_update:   { color: "text-purple-400",  icon: Settings,      bg: "bg-purple-400/15" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admin" },
  { value: "marketplace", label: "Marketplace" },
  { value: "promotions", label: "Promos" },
  { value: "message", label: "Messages" },
];

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

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

  const filtered = notifications.filter(n =>
    filter === "all" ? true : (n.type === filter || n.category === filter)
  );
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <Bell className="w-5 h-5 text-orange-400" />
        <h1 className="text-lg font-heading font-bold flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">{unreadCount}</span>
        )}
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-orange-400 flex items-center gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all
          </button>
        )}
      </div>

      <div className="p-4 space-y-2 pb-24">
        {isLoading && Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton-glass" />)}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1 opacity-60">We'll notify you about important updates</p>
          </div>
        )}
        {filtered.map(n => {
          const meta = TYPE_META[n.type] || TYPE_META.info;
          const IconComp = meta.icon;
          return (
            <GlassCard key={n.id}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${!n.is_read ? "border-orange-400/25" : ""}`}
              onClick={() => !n.is_read && markRead.mutate(n.id)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                <IconComp className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-bold ${meta.color}`}>{n.title}</p>
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    {n.image_url && <img src={n.image_url} alt="" className="mt-2 rounded-xl max-h-24 object-cover w-full" />}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/50">
                        {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "like", current: n.reaction }); }}
                      className={`p-1.5 rounded-lg transition-colors ${n.reaction === "like" ? "text-green-400" : "hover:text-green-400 text-muted-foreground"}`}>
                      <ThumbsUp className="w-3.5 h-3.5" fill={n.reaction === "like" ? "currentColor" : "none"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "dislike", current: n.reaction }); }}
                      className={`p-1.5 rounded-lg transition-colors ${n.reaction === "dislike" ? "text-red-400" : "hover:text-red-400 text-muted-foreground"}`}>
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
    </div>
  );
}
