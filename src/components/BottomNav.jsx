import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Bookmark, MessageSquare, User, Plus, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["chats-unread", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("unread_count_buyer, unread_count_seller, buyer_id, seller_id")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);
      if (error) return 0;
      return data.reduce((acc, c) => {
        if (c.buyer_id === user.id) return acc + (c.unread_count_buyer || 0);
        if (c.seller_id === user.id) return acc + (c.unread_count_seller || 0);
        return acc;
      }, 0);
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const { data: listingData } = useQuery({
    queryKey: ["user-listing-count", user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("created_by_id", user.id)
        .eq("status", "active");
      return { isPro: profile?.is_pro || false, count: count || 0 };
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`bottomnav-chats-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, () => {
        queryClient.invalidateQueries({ queryKey: ["chats-unread", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const handleSellPress = () => {
    if (!listingData) { navigate("/create-listing"); return; }
    const { isPro, count } = listingData;
    const limit = isPro ? 30 : 10;
    if (count >= limit) { setShowLimitPopup(true); return; }
    navigate("/create-listing");
  };

  const NAV_LEFT = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/chats", icon: MessageSquare, label: "Chats", badge: unreadCount },
  ];
  const NAV_RIGHT = [
    { path: "/saved", icon: Bookmark, label: "Saved" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5 safe-area-bottom">
          {NAV_LEFT.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl relative",
                isActive(path) ? "text-orange-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}

          <button onClick={handleSellPress} className="flex flex-col items-center gap-0.5">
            <div
              className="w-14 h-14 -mt-7 rounded-full flex items-center justify-center shadow-xl border border-orange-300/30"
              style={{
                background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
                boxShadow: "0 6px 20px rgba(255,107,0,0.55), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <Plus className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Sell</span>
          </button>

          {NAV_RIGHT.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl relative",
                isActive(path) ? "text-orange-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {showLimitPopup && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowLimitPopup(false)}>
          <div className="glass rounded-2xl border border-orange-400/30 p-5 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Listing Limit Reached</p>
                  <p className="text-xs text-muted-foreground">
                    {listingData?.isPro ? "Pro sellers can post up to 30 listings." : "Regular sellers can post up to 10 listings."}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowLimitPopup(false)} className="p-1 shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              To post more, delete or deactivate some of your existing listings — or upgrade to Pro for up to 30 listings.
            </p>
            <div className="flex gap-2">
              {!listingData?.isPro && (
                <button
                  onClick={() => { setShowLimitPopup(false); navigate("/pro-upgrade"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white"
                >
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => { setShowLimitPopup(false); navigate("/profile"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold glass text-foreground"
              >
                Manage Listings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


