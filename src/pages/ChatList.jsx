import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { MessageSquare, Search, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

const SUPPORT_USER_ID = "1629c76b-0af3-48b0-bf03-cf73710e6d57";
const SUPPORT_NAME = "FutaMart Support";
const SUPPORT_AVATAR = "https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg";

function formatChatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export default function ChatList() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["my-chats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order("last_message_time", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chat-list-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, (payload) => {
        const row = payload.new || payload.old;
        if (row?.seller_id === user.id || row?.buyer_id === user.id) {
          queryClient.invalidateQueries({ queryKey: ["my-chats", user.id] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const { mutate: openSupportChat, isPending: openingSupport } = useMutation({
    mutationFn: async () => {
      if (user.id === SUPPORT_USER_ID) return null;

      // Always check first
      const { data: existing } = await supabase
        .from("chats")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("seller_id", SUPPORT_USER_ID)
        .maybeSingle();
      if (existing) { navigate(`/chat/${existing.id}`); return null; }

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const { data: chat, error } = await supabase
        .from("chats")
        .insert({
          listing_id: "00000000-0000-0000-0000-000000000000",
          listing_title: "Customer Support",
          listing_image: SUPPORT_AVATAR,
          listing_price: null,
          seller_id: SUPPORT_USER_ID,
          seller_name: SUPPORT_NAME,
          seller_avatar: SUPPORT_AVATAR,
          buyer_id: user.id,
          buyer_name: myProfile?.full_name || "User",
          buyer_avatar: myProfile?.avatar_url || "",
        })
        .select()
        .single();
      if (error) throw error;
      return chat;
    },
    onSuccess: (chat) => {
      if (!chat) return;
      queryClient.invalidateQueries({ queryKey: ["my-chats", user.id] });
      navigate(`/chat/${chat.id}`);
    },
    onError: () => toast.error("Could not open support chat"),
  });

  const getOtherParty = (chat) => {
    if (chat.seller_id === user.id) {
      return { name: chat.buyer_name, avatar: chat.buyer_avatar, id: chat.buyer_id };
    }
    return { name: chat.seller_name, avatar: chat.seller_avatar, id: chat.seller_id };
  };

  const filtered = chats.filter((chat) => {
    const isSupportChat = chat.seller_id === SUPPORT_USER_ID || chat.buyer_id === SUPPORT_USER_ID || chat.listing_title === "Customer Support";
    if (isSupportChat) return false;
    if (!search) return true;
    const other = getOtherParty(chat);
    return other.name?.toLowerCase().includes(search.toLowerCase()) ||
      chat.listing_title?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <h1 className="text-lg font-display font-bold text-foreground mb-2">Chats</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="glass border-white/10 pl-9 h-9 text-sm rounded-full" />
          </div>
          <button
            onClick={() => openSupportChat()}
            disabled={openingSupport}
            className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
              boxShadow: "0 3px 12px rgba(255,107,0,0.4)",
              opacity: openingSupport ? 0.7 : 1,
            }}
          >
            <Headphones className="w-3.5 h-3.5" />
            Support
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          Array(3).fill(0).map((_, i) =>
            <div key={i} className="glass rounded-2xl h-[72px] skeleton-glass" />
          )
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{search ? "No chats found" : "No chats yet"}</p>
            <p className="text-sm mt-1">{search ? "Try a different name" : "Start chatting by contacting a seller"}</p>
          </div>
        ) : (
          filtered.map((chat) => {
            const other = getOtherParty(chat);
            const unread = chat.seller_id === user.id ? chat.unread_count_seller : chat.unread_count_buyer;
            const hasUnread = unread > 0;
            const isSupport = other.id === SUPPORT_USER_ID || chat.listing_title === "Customer Support";
            return (
              <Link key={chat.id} to={`/chat/${chat.id}`}>
                <GlassCard
                  className="flex items-center gap-3 p-3 rounded-2xl hover:brightness-110 transition-all"
                  style={{ background: isSupport
                    ? "linear-gradient(135deg, rgba(255,107,0,0.18), rgba(255,140,0,0.08))"
                    : "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.05))" }}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full ring-1 ring-white/10 bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center overflow-hidden">
                      {other.avatar ? (
                        <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-bold text-orange-400">{other.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    {isSupport && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <Headphones className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[15px] truncate ${hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>
                        {isSupport ? "FutaMart Support" : other.name}
                      </p>
                      <span className={`text-[11px] shrink-0 ${hasUnread ? "text-orange-400 font-semibold" : "text-muted-foreground/60"}`}>
                        {formatChatTime(chat.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-[13px] truncate ${hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                        {isSupport ? (chat.last_message || "Tap to chat with support") : (chat.last_message || chat.listing_title)}
                      </p>
                      {hasUnread && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-[11px] font-bold text-white flex items-center justify-center shadow-sm shadow-orange-500/30">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
