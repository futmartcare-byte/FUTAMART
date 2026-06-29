import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ProCrown from "@/components/ProCrown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star,
  ArrowLeft, Search, Shield, Crown, UserCheck, Ban, Key, Bell, Lightbulb,
  Send, Users, User, BarChart3, Package, Flag, Settings,
  Trash2, CheckCircle, XCircle, RefreshCw, Image as ImageIcon,
  TrendingUp, MessageSquare, AlertCircle, History, Eye, Headphones, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, isToday } from "date-fns";

const ADMIN_EMAIL = "futmartzite@gmail.com";
const ADMIN_PASSWORD = "2456";

import { uploadToCloudinary } from "@/lib/uploadImage";



// ---- Suggestions Tab ----
function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("suggestions").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setSuggestions(data || []);
      setLoading(false);
    });
  }, []);
  const COLORS = { "UI / Design": "text-purple-400", "New Feature": "text-green-400", "Bug Report": "text-red-400", "Performance": "text-blue-400", "Chat": "text-cyan-400", "Listings": "text-orange-400", "Notifications": "text-yellow-400", "Other": "text-muted-foreground" };
  return (
    <div className="space-y-3 p-4">
      <h2 className="text-sm font-bold text-foreground">User Suggestions ({suggestions.length})</h2>
      {loading ? <div className="text-xs text-muted-foreground">Loading...</div> : suggestions.length === 0 ? (
        <div className="text-xs text-muted-foreground">No suggestions yet.</div>
      ) : suggestions.map((s) => (
        <div key={s.id} className="glass rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className={"text-xs font-bold " + (COLORS[s.category] || "text-muted-foreground")}>{s.category}</span>
            <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-foreground">{s.message}</p>
          <p className="text-[10px] text-muted-foreground">— {s.username}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Waitlist Tab ----
function WaitlistTab() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("pro_waitlist").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setWaitlist(data || []);
      setLoading(false);
    });
  }, []);
  return (
    <div className="space-y-3 p-4">
      <h2 className="text-sm font-bold text-foreground">Pro Waitlist ({waitlist.length})</h2>
      {loading ? <div className="text-xs text-muted-foreground">Loading...</div> : waitlist.length === 0 ? (
        <div className="text-xs text-muted-foreground">No waitlist entries yet.</div>
      ) : waitlist.map((entry, i) => (
        <div key={entry.id} className="glass rounded-2xl p-3 flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{entry.email}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Reports Tab ----
function ReportsTab() {
  const navigate = useNavigate();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-400" /> Reports
        </h3>
        {reports.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold">{reports.length}</span>
        )}
      </div>
      {isLoading ? (
        Array(3).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-[72px] skeleton-glass" />)
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reports yet</p>
          <p className="text-sm mt-1">Reported listings and sellers will appear here</p>
        </div>
      ) : (
        reports.map(r => (
          <GlassCard key={r.id} className="p-3 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${r.target_type === "listing" ? "bg-orange-500/20" : "bg-red-500/20"}`}>
              <Flag className={`w-4 h-4 ${r.target_type === "listing" ? "text-orange-400" : "text-red-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.target_name}</p>
              <p className="text-xs text-muted-foreground">{r.target_type === "listing" ? "Listing" : "Seller"} · {r.reason}</p>
              {r.details && <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{r.details}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                {r.target_type === "listing" && (
                  <button onClick={() => navigate(`/listing/${r.target_id}`)}
                    className="text-[11px] text-orange-400 font-medium">View Listing</button>
                )}
                {r.target_type === "seller" && (
                  <button onClick={() => navigate(`/seller/${r.target_id}`)}
                    className="text-[11px] text-orange-400 font-medium">View Seller</button>
                )}
              </div>
            </div>
            <button onClick={() => deleteReport.mutate(r.id)} className="p-1 text-muted-foreground hover:text-red-400 shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </GlassCard>
        ))
      )}
    </div>
  );
}

// ---- Support Tab ----
const SUPPORT_PASSWORD = "futamart2025";

function SupportTab() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);


  const { data: supportChats = [], isLoading } = useQuery({
    queryKey: ["support-chats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("seller_id", "1629c76b-0af3-48b0-bf03-cf73710e6d57")
        .eq("listing_title", "Customer Support")
        .order("last_message_time", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const totalUnread = supportChats.reduce((sum, c) => sum + (c.unread_count_seller || 0), 0);

  if (!unlocked) return (
    <div className="p-6 flex flex-col items-center justify-center gap-4 pt-16">
      <Headphones className="w-10 h-10 text-orange-400 opacity-70" />
      <p className="text-sm font-semibold text-center">Support Inbox is protected</p>
      <p className="text-xs text-muted-foreground text-center">Enter the support password to continue</p>
      <input
        type="password"
        value={pwInput}
        onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (pwInput === SUPPORT_PASSWORD) { setUnlocked(true); }
            else { setPwError(true); setPwInput(""); }
          }
        }}
        placeholder="Enter password"
        className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-center focus:outline-none focus:border-orange-400"
        style={{ WebkitUserSelect: "text", userSelect: "text" }}
      />
      {pwError && <p className="text-xs text-red-400">Incorrect password</p>}
      <button
        onClick={() => {
          if (pwInput === SUPPORT_PASSWORD) { setUnlocked(true); }
          else { setPwError(true); setPwInput(""); }
        }}
        className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#FF6B00,#FFB000)" }}>
        Unlock
      </button>
    </div>
  );

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Headphones className="w-4 h-4 text-orange-400" /> Support Inbox
        </h3>
        {totalUnread > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-bold">
            {totalUnread} unread
          </span>
        )}
      </div>
      {isLoading ? (
        Array(3).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-[72px] skeleton-glass" />)
      ) : supportChats.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No support chats yet</p>
          <p className="text-sm mt-1">Users who tap Support will appear here</p>
        </div>
      ) : (
        supportChats.map((chat) => {
          const unread = chat.unread_count_seller || 0;
          const hasUnread = unread > 0;
          return (
            <GlassCard
              key={chat.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:brightness-110 transition-all cursor-pointer"
              style={{ background: hasUnread ? "linear-gradient(135deg, rgba(255,107,0,0.18), rgba(255,140,0,0.08))" : "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.05))" }}
              onClick={() => navigate(`/chat/${chat.id}?from=admin`)}
            >
              <div className="w-12 h-12 rounded-full ring-1 ring-white/10 bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center overflow-hidden shrink-0">
                {chat.buyer_avatar ? (
                  <img src={chat.buyer_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base font-bold text-orange-400">{chat.buyer_name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[15px] truncate ${hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>
                    {chat.buyer_name || "User"}
                  </p>
                  <span className={`text-[11px] shrink-0 ${hasUnread ? "text-orange-400 font-semibold" : "text-muted-foreground/60"}`}>
                    {chat.last_message_time ? format(new Date(chat.last_message_time), isToday(new Date(chat.last_message_time)) ? "h:mm a" : "MMM d") : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={`text-[13px] truncate ${hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                    {chat.last_message || "No messages yet"}
                  </p>
                  {hasUnread && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-[11px] font-bold text-white flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}

// ---- Dashboard Stats ----
function DashboardTab({ profiles, listings, notifications }) {
  const activeListings = listings.filter(l => l.status === "active").length;
  const soldListings = listings.filter(l => l.status === "sold").length;
  const newUsersToday = profiles.filter(p => p.created_at && isToday(new Date(p.created_at))).length;
  const newListingsToday = listings.filter(l => l.created_at && isToday(new Date(l.created_at))).length;

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-blue-400" },
    { label: "Total Listings", value: listings.length, icon: Package, color: "text-green-400" },
    { label: "Active Listings", value: activeListings, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Sold", value: soldListings, icon: Star, color: "text-yellow-400" },
    { label: "Notifications Sent", value: notifications.length, icon: Bell, color: "text-orange-400" },
    { label: "New Users Today", value: newUsersToday, icon: TrendingUp, color: "text-purple-400" },
    { label: "New Listings Today", value: newListingsToday, icon: BarChart3, color: "text-pink-400" },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <GlassCard key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ---- Users Tab ----
function SpectateChatsModal({ profile, onClose }) {
  const navigate = useNavigate();
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["admin-spectate-chats", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order("last_message_time", { ascending: false, nullsFirst: false });
      console.log("spectate chats:", data, error);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto pb-24"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-400" /> {profile.full_name || profile.username}'s Chats
          </p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="glass rounded-xl h-14 skeleton-glass" />)
        ) : chats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No chats found</p>
        ) : (
          chats.map(chat => {
            const other = chat.buyer_id === profile.id
              ? { name: chat.seller_name, avatar: chat.seller_avatar }
              : { name: chat.buyer_name, avatar: chat.buyer_avatar };
            return (
              <button key={chat.id} onClick={() => { navigate(`/chat/${chat.id}?spectate=1&uid=${profile.id}&from=admin`); onClose(); }}
                className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:brightness-110 text-left">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {other.avatar
                    ? <img src={other.avatar} alt="" className="w-full h-full object-cover allow-interaction" />
                    : <span className="text-sm font-bold text-orange-400">{other.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{other.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{chat.last_message || chat.listing_title}</p>
                </div>
                <Eye className="w-4 h-4 text-orange-400 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function UsersTab({ profiles, onAction }) {
  const [search, setSearch] = useState("");
  const [spectating, setSpectating] = useState(null);
  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_number?.includes(search)
  );

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-card border-white/10 pl-9" />
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} users found</p>
      <div className="space-y-2">
        {filtered.map(profile => (
          <GlassCard key={profile.id} className="p-3 flex items-center gap-3">
            <Link to={`/seller/${profile.id}`} className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-sm font-bold text-orange-400 overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.username?.[0]?.toUpperCase()}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                {profile.is_pro_seller && <ProCrown />}
                {profile.is_banned && <span className="text-[10px] text-red-400 font-bold bg-red-400/10 px-1.5 py-0.5 rounded-full">BANNED</span>}
              </div>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
              {profile.created_at && (
                <p className="text-[10px] text-muted-foreground/60">Joined {format(new Date(profile.created_at), "MMM d, yyyy")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <GlassButton variant="ghost" size="sm" className="text-xs px-2 h-7"
                onClick={() => onAction({ type: "pro", profileId: profile.id, isPro: profile.is_pro_seller, name: profile.full_name })}>
                {profile.is_pro_seller ? <><UserCheck className="w-3 h-3 mr-1" />Pro</> : <><Crown className="w-3 h-3 mr-1" />Pro</>}
              </GlassButton>
              <GlassButton variant="ghost" size="sm"
                className={`text-xs px-2 h-7 ${profile.is_banned ? "text-green-400" : "text-red-400"}`}
                onClick={() => onAction({ type: "ban", profileId: profile.id, isBanned: profile.is_banned, name: profile.full_name })}>
                <Ban className="w-3 h-3 mr-1" />{profile.is_banned ? "Unban" : "Ban"}
              </GlassButton>
              <GlassButton variant="ghost" size="sm" className="text-xs px-2 h-7 text-orange-400"
                onClick={() => setSpectating(profile)}>
                <Eye className="w-3 h-3 mr-1" />Chats
              </GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>
      {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
    </div>
  );
}


// ---- Listings Tab ----
function ListingsTab({ listings, profiles, onRemoveListing, onFeatureListing }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const CATS = ["all", "electronics", "vehicles", "fashion", "home_garden", "sports", "books", "services", "other"];

  const filtered = listings.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || l.category === catFilter;
    return matchSearch && matchCat;
  });

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="bg-card border-white/10 pl-9" />
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-all ${catFilter === c ? "bg-orange-500 text-white" : "glass text-muted-foreground"}`}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} listings</p>
      <div className="space-y-2">
        {filtered.slice(0, 50).map(listing => {
          const owner = profileMap[listing.created_by_id];
          return (
            <GlassCard key={listing.id} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-card">
                {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{listing.title}</p>
                <p className="text-xs text-orange-400">â‚¦{listing.price?.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    listing.status === "active" ? "bg-green-400/10 text-green-400" :
                    listing.status === "sold" ? "bg-blue-400/10 text-blue-400" : "bg-muted text-muted-foreground"
                  }`}>{listing.status}</span>
                  {owner && <span className="text-[10px] text-muted-foreground">@{owner.username}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <GlassButton variant="ghost" size="sm" className="text-xs px-2 h-7 text-yellow-400"
                  onClick={() => onFeatureListing(listing.id, listing.is_featured)}>
                  <Star className="w-3 h-3 mr-1" />{listing.is_featured ? "Unfeature" : "Feature"}
                </GlassButton>
                <GlassButton variant="ghost" size="sm" className="text-xs px-2 h-7 text-red-400"
                  onClick={() => onRemoveListing(listing.id)}>
                  <Trash2 className="w-3 h-3 mr-1" />Remove
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

// ---- Reaction Count Component ----
function ReactionCount({ broadcastId }) {
  const { data } = useQuery({
    queryKey: ["reaction-count", broadcastId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("reaction")
        .eq("broadcast_id", broadcastId)
        .not("reaction", "is", null);
      if (error) throw error;
      const likes = data.filter(r => r.reaction === "like").length;
      const dislikes = data.filter(r => r.reaction === "dislike").length;
      const total = data.length + (await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("broadcast_id", broadcastId)).count;
      return { likes, dislikes };
    },
    refetchInterval: 30000,
  });

  if (!data) return null;

  return (
    <div className="flex items-center gap-3 pt-1 border-t border-white/5">
      <span className="text-[10px] text-muted-foreground">Reactions:</span>
      <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
        <ThumbsUp className="w-3 h-3" fill="currentColor" /> {data.likes}
      </span>
      <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
        <ThumbsDown className="w-3 h-3" fill="currentColor" /> {data.dislikes}
      </span>
    </div>
  );
}

// ---- Notifications Tab ----
function NotificationsTab({ profiles, sentNotifications, onRefresh }) {
  const queryClient = useQueryClient();
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [targetSearch, setTargetSearch] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const filteredTargets = profiles.filter(p =>
    p.username?.toLowerCase().includes(targetSearch.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(targetSearch.toLowerCase())
  );
  const targetProfile = broadcastTarget !== "all" && broadcastTarget !== "pro"
    ? profiles.find(p => p.id === broadcastTarget) : null;

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const sendBroadcast = useMutation({
    mutationFn: async () => {
      if (!broadcastTitle.trim() || !broadcastMsg.trim()) throw new Error("Fill all fields");
      let image_url = null;
      if (imageFile) {
        image_url = await uploadToCloudinary(imageFile, "futmart/notifications");
      }
      const broadcastId = crypto.randomUUID();
      const payload = {
        broadcast_id: broadcastId,
        title: broadcastTitle.trim(),
        message: broadcastMsg.trim(),
        type: "admin",
        category: "admin",
        from_name: "FUTAMART Admin",
        is_read: false,
        ...(image_url ? { image_url } : {}),
      };
      let targets = [];
      if (broadcastTarget === "all") targets = profiles;
      else if (broadcastTarget === "pro") targets = profiles.filter(p => p.is_pro_seller);
      else targets = profiles.filter(p => p.id === broadcastTarget);

      const rows = targets.map(p => ({ ...payload, user_id: p.id }));
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) { console.error("NOTIF ERROR:", JSON.stringify(error)); throw new Error(error.message); }
      return targets.length;
    },
    onSuccess: (count) => {
      toast.success(`Notification sent to ${count} user(s)!`);
      setBroadcastTitle(""); setBroadcastMsg(""); setBroadcastTarget("all");
      setImageFile(null); setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      onRefresh?.();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteNotif = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Send form */}
      <GlassCard className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-orange-400" /> Send Notification</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Send to</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {[["all", "All Users"], ["pro", "PRO Only"], ["pick", "Specific"]].map(([val, label]) => (
              <button key={val} onClick={() => setBroadcastTarget(val)}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${broadcastTarget === val ? "glass-orange text-white" : "glass text-muted-foreground"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {broadcastTarget === "pick" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={targetSearch} onChange={e => setTargetSearch(e.target.value)} placeholder="Search user..." className="glass border-white/10 pl-8 text-sm h-9" />
            </div>
            {targetSearch && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filteredTargets.map(p => (
                  <button key={p.id} onClick={() => { setBroadcastTarget(p.id); setTargetSearch(""); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg glass text-left">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs">{p.full_name} <span className="text-muted-foreground">@{p.username}</span></span>
                  </button>
                ))}
              </div>
            )}
            {targetProfile && (
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium">{targetProfile.full_name} @{targetProfile.username}</span>
              </div>
            )}
          </div>
        )}

        <Input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="Notification title..." className="glass border-white/10 text-sm" />
        <Textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Your message..." className="glass border-white/10 text-sm h-20" />

        {/* Image upload */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer glass px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground">
            <ImageIcon className="w-3.5 h-3.5" /> Add Image (optional)
            <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          </label>
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>

        <GlassButton variant="orange" className="w-full" onClick={() => sendBroadcast.mutate()}
          disabled={sendBroadcast.isPending || !broadcastTitle || !broadcastMsg}>
          <Send className="w-4 h-4 mr-2" />
          {sendBroadcast.isPending ? "Sending..." : "Send Notification"}
        </GlassButton>
      </GlassCard>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><History className="w-4 h-4 text-muted-foreground" /> Recent Sent (Admin)</h3>
        <div className="space-y-2">
          {sentNotifications.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No notifications sent yet</p>
          )}
          {sentNotifications.slice(0, 20).map(n => (
            <GlassCard key={n.id} className="p-3 space-y-2">
              <div className="flex items-start gap-3">
                {n.image_url && <img src={n.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  {n.created_at ? format(new Date(n.created_at), "MMM d, h:mm a") : ""} Â· {n.is_read ? "Read" : "Unread"}
                </p>
              </div>
              <button onClick={() => deleteNotif.mutate(n.id)} className="p-1 text-muted-foreground hover:text-red-400 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              </div>
              {n.broadcast_id && <ReactionCount broadcastId={n.broadcast_id} />}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Main Admin ----

function ProSellersTab() {
  const [proSellers, setProSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [carouselSlots, setCarouselSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_pro_seller")
        .eq("is_pro_seller", true);
      setProSellers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSlots() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, images, seller_username, carousel_show_count, is_carousel_pinned, status, created_by_id, seller_is_pro")
        .eq("seller_is_pro", true)
        .eq("status", "active")
        .eq("is_carousel_pinned", true)
        .order("carousel_show_count", { ascending: true })
        .limit(20);
      setCarouselSlots(data || []);
    }
    loadSlots();
  }, []);

  async function loadSellerListings(seller) {
    setSelectedSeller(seller);
    const { data } = await supabase
      .from("listings")
      .select("id, title, price, images, status, carousel_show_count, is_carousel_pinned")
      .eq("created_by_id", seller.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setSellerListings(data || []);
  }

  async function togglePin(listing) {
    const newVal = !listing.is_carousel_pinned;
    const pinned = carouselSlots.filter(l => l.id !== listing.id && l.is_carousel_pinned);
    if (newVal && pinned.length >= 20) {
      toast.error("Carousel is full — remove a listing first (max 20)");
      return;
    }
    await supabase.from("listings").update({ is_carousel_pinned: newVal }).eq("id", listing.id);
    setSellerListings(prev => prev.map(l => l.id === listing.id ? { ...l, is_carousel_pinned: newVal } : l));
    setCarouselSlots(prev => {
      if (newVal) return [...prev, { ...listing, is_carousel_pinned: true }];
      return prev.filter(l => l.id !== listing.id);
    });
    toast.success(newVal ? "Added to carousel" : "Removed from carousel");
  }

  async function removeFromCarousel(listing) {
    await supabase.from("listings").update({ is_carousel_pinned: false }).eq("id", listing.id);
    setCarouselSlots(prev => prev.filter(l => l.id !== listing.id));
    setSellerListings(prev => prev.map(l => l.id === listing.id ? { ...l, is_carousel_pinned: false } : l));
    toast.success("Removed from carousel");
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-bold text-orange-400">Carousel Slots ({carouselSlots.length}/20)</h2>

      {carouselSlots.length > 0 && (
        <div className="space-y-2">
          {carouselSlots.map((l, i) => (
            <GlassCard key={l.id} className="flex items-center gap-3 p-2">
              <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
              {l.images?.[0] && <img src={l.images[0]} className="w-10 h-10 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{l.title}</p>
                <p className="text-[10px] text-muted-foreground">@{l.seller_username} · shown {l.carousel_show_count}x</p>
              </div>
              <GlassButton variant="ghost" className="text-[10px] px-2 py-1 text-red-400" onClick={() => removeFromCarousel(l)}>Remove</GlassButton>
            </GlassCard>
          ))}
        </div>
      )}

      {carouselSlots.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No listings pinned to carousel yet. Pin listings from pro sellers below.</p>
      )}

      <h2 className="text-sm font-bold text-orange-400 pt-2">Pro Sellers</h2>
      <div className="space-y-2">
        {proSellers.map(seller => (
          <GlassCard key={seller.id} className="p-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => loadSellerListings(seller)}>
              {seller.avatar_url
                ? <img src={seller.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">{seller.username?.[0]}</div>
              }
              <div className="flex-1">
                <p className="text-xs font-semibold">@{seller.username}</p>
                <p className="text-[10px] text-muted-foreground">Tap to view listings</p>
              </div>
              <span className="text-orange-400 text-[10px]">▼</span>
            </div>

            {selectedSeller?.id === seller.id && (
              <div className="mt-3 space-y-2">
                {sellerListings.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No active listings</p>
                )}
                {sellerListings.map(listing => (
                  <div key={listing.id} className="flex items-center gap-2 p-2 rounded-xl glass">
                    {listing.images?.[0] && <img src={listing.images[0]} className="w-9 h-9 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{listing.title}</p>
                      <p className="text-[10px] text-muted-foreground">₦{listing.price?.toLocaleString()} · shown {listing.carousel_show_count}x</p>
                    </div>
                    <GlassButton
                      variant={listing.is_carousel_pinned ? "orange" : "ghost"}
                      className="text-[10px] px-2 py-1 shrink-0"
                      onClick={() => togglePin(listing)}
                    >
                      {listing.is_carousel_pinned ? "Pinned ✓" : "Pin"}
                    </GlassButton>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState(null);
  const [authPassword, setAuthPassword] = useState("");
  const [pagePassword, setPagePassword] = useState("");
  const [pageUnlocked, setPageUnlocked] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: sentNotifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "admin")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const togglePro = useMutation({
    mutationFn: async ({ profileId, isPro }) => {
      const { error } = await supabase.from("profiles").update({ is_pro_seller: !isPro }).eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }); toast.success("PRO status updated!"); setConfirmAction(null); setAuthPassword(""); },
  });

  const toggleBan = useMutation({
    mutationFn: async ({ profileId, isBanned }) => {
      const { error } = await supabase.from("profiles").update({ is_banned: !isBanned }).eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }); toast.success("Ban status updated!"); setConfirmAction(null); setAuthPassword(""); },
  });

  const removeListing = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-listings"] }); toast.success("Listing removed"); },
  });

  const featureListing = useMutation({
    mutationFn: async ({ id, isFeatured }) => {
      const { error } = await supabase.from("listings").update({ is_featured: !isFeatured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-listings"] }); toast.success("Updated!"); },
  });

  const handleConfirm = () => {
    if (authPassword !== ADMIN_PASSWORD) { toast.error("Incorrect admin password"); return; }
    if (confirmAction.type === "ban") toggleBan.mutate(confirmAction);
    else togglePro.mutate(confirmAction);
  };

  if (user?.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  if (!pageUnlocked) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="p-6 max-w-sm w-full space-y-4 text-center">
        <Shield className="w-10 h-10 text-orange-400 mx-auto" />
        <h2 className="text-lg font-display font-bold">Admin Access</h2>
        <p className="text-sm text-muted-foreground">Enter the admin password to continue</p>
        <Input
          type="password"
          value={pagePassword}
          onChange={e => setPagePassword(e.target.value)}
          placeholder="Admin password"
          className="bg-card border-white/10 text-center"
          onKeyDown={e => {
            if (e.key === "Enter") {
              if (pagePassword === ADMIN_PASSWORD) setPageUnlocked(true);
              else { toast.error("Incorrect password"); setPagePassword(""); }
            }
          }}
        />
        <GlassButton variant="orange" className="w-full" onClick={() => {
          if (pagePassword === ADMIN_PASSWORD) setPageUnlocked(true);
          else { toast.error("Incorrect password"); setPagePassword(""); }
        }}>
          <Key className="w-4 h-4 mr-2" /> Unlock Dashboard
        </GlassButton>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <Shield className="w-5 h-5 text-orange-400" />
        <h1 className="text-lg font-heading font-bold">Admin Panel</h1>
        <span className="ml-auto text-xs text-orange-400 font-medium glass px-2 py-0.5 rounded-full">ADMIN</span>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="glass flex h-10 rounded-none border-b border-white/5 w-max">
            <TabsTrigger value="dashboard" className="text-[10px] flex items-center gap-1"><BarChart3 className="w-3 h-3" />Stats</TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] flex items-center gap-1"><Users className="w-3 h-3" />Users</TabsTrigger>
            <TabsTrigger value="listings" className="text-[10px] flex items-center gap-1"><Package className="w-3 h-3" />Listings</TabsTrigger>
            <TabsTrigger value="notify" className="text-[10px] flex items-center gap-1"><Bell className="w-3 h-3" />Notify</TabsTrigger>
            <TabsTrigger value="support" className="text-[10px] flex items-center gap-1"><Headphones className="w-3 h-3" />Support</TabsTrigger>
            <TabsTrigger value="waitlist" className="text-[10px]">Waitlist</TabsTrigger>
            <TabsTrigger value="suggestions" className="text-[10px] flex items-center gap-1"><Lightbulb className="w-3 h-3" />Ideas</TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] flex items-center gap-1"><Flag className="w-3 h-3" />Reports</TabsTrigger>
            <TabsTrigger value="prosellers" className="text-[10px] flex items-center gap-1"><Star className="w-3 h-3" />Pro</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <DashboardTab profiles={profiles} listings={listings} notifications={sentNotifications} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab profiles={profiles} onAction={setConfirmAction} />
        </TabsContent>

        <TabsContent value="listings">
          <ListingsTab
            listings={listings}
            profiles={profiles}
            onRemoveListing={(id) => removeListing.mutate(id)}
            onFeatureListing={(id, isFeatured) => featureListing.mutate({ id, isFeatured })}
          />
        </TabsContent>

        <TabsContent value="notify">
          <NotificationsTab
            profiles={profiles}
            sentNotifications={sentNotifications}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })}
          />
        </TabsContent>

        <TabsContent value="support">
          <SupportTab />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsTab />
        </TabsContent>
        <TabsContent value="waitlist">
          <WaitlistTab />
        </TabsContent>
        <TabsContent value="settings">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="prosellers">
          <ProSellersTab />
        </TabsContent>
      </Tabs>

      {/* Auth Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => { setConfirmAction(null); setAuthPassword(""); }}>
        <DialogContent className="bg-card border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Key className="w-4 h-4 text-orange-400" /> Confirm Action
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground">
            {confirmAction?.type === "ban"
              ? `${confirmAction?.isBanned ? "Unban" : "Ban"} ${confirmAction?.name}?`
              : `${confirmAction?.isPro ? "Remove PRO from" : "Grant PRO to"} ${confirmAction?.name}?`}
          </p>
          <p className="text-xs text-center text-muted-foreground mt-1">Enter admin password to proceed.</p>
          <Input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
            placeholder="Admin password" className="bg-card border-white/10"
            onKeyDown={e => e.key === "Enter" && handleConfirm()} />
          <DialogFooter className="flex gap-2 sm:justify-center">
            <GlassButton variant="ghost" onClick={() => { setConfirmAction(null); setAuthPassword(""); }} className="flex-1">Cancel</GlassButton>
            <GlassButton variant="orange" onClick={handleConfirm} disabled={!authPassword} className="flex-1">Confirm</GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




























