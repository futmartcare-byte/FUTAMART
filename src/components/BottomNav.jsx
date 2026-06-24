import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, MessageSquare, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

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
    refetchInterval: 10000,
  });

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

        <Link to="/create-listing" className="flex flex-col items-center gap-0.5">
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
        </Link>

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
  );
}