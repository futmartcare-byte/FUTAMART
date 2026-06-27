import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Shield, Bell, Loader2 } from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import ListingSkeleton from "@/components/ListingSkeleton";
import AIChatBot from "@/components/AIChatBot";

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "vehicles", label: "Vehicles" },
  { value: "fashion", label: "Fashion" },
  { value: "home_garden", label: "Home" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const GLASS_AMBER = "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.05))";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loaderRef = useRef(null);
  const queryClient = useQueryClient();

  const fetchListings = useCallback(async (pageNum, category, replace = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (category !== "all") {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (error) throw error;
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    if (replace) {
      setListings(shuffled);
    } else {
      setListings((prev) => [...prev, ...shuffled]);
    }
    setHasMore(data.length === PAGE_SIZE);
    return data;
  }, []);

  // Initial load + category change
  useEffect(() => {
    setIsInitialLoading(true);
    setPage(0);
    setHasMore(true);
    fetchListings(0, activeCategory, true).finally(() => setIsInitialLoading(false));
  }, [activeCategory, fetchListings]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isInitialLoading) {
          setIsFetchingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchListings(nextPage, activeCategory).finally(() => setIsFetchingMore(false));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isInitialLoading, page, activeCategory, fetchListings]);

  const { data: savedListings = [] } = useQuery({
    queryKey: ["saved-listings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 20000,
  });

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;
  const savedIds = new Set(savedListings.map((s) => s.listing_id));

  const toggleSave = useMutation({
    mutationFn: async (listingId) => {
      const existing = savedListings.find((s) => s.listing_id === listingId);
      if (existing) {
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_listings")
          .insert({ listing_id: listingId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-listings"] }),
  });

  if (isAuthenticated && !profileLoading && !profile) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSaveClick = (listingId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleSave.mutate(listingId);
  };

  const handleProtectedNavClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg"
              alt="FUTAMART"
              className="w-8 h-8 object-contain"
              style={{ borderRadius: "20%" }}
            />
            <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">
              FUTA<span className="text-orange-400">MART</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && user?.email === "futmartzite@gmail.com" && (
              <Link
                to="/admin"
                className="p-2 rounded-xl hover:brightness-110 transition-all"
                style={{ background: GLASS_AMBER, backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                <Shield className="w-4 h-4 text-orange-400" />
              </Link>
            )}
            <Link
              to="/search"
              className="p-2 rounded-xl hover:brightness-110 transition-all"
              style={{ background: GLASS_AMBER, backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              to="/notifications"
              onClick={handleProtectedNavClick}
              className="relative p-2 rounded-xl hover:brightness-110 transition-all"
              style={{ background: GLASS_AMBER, backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 shadow-sm shadow-orange-500/40">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-4 pt-3">
        <div className="rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/4f8c8752a_THEFEDERALUNIVERSITYOFTECHNOLOGYAKURE1.png"
            alt="Futarians New Marketplace"
            className="w-full object-cover rounded-sm"
            style={{ maxHeight: 180 }}
          />
        </div>
      </div>

      {/* Guest banner */}
      {!isAuthenticated && (
        <div className="px-4 pt-3">
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: GLASS_AMBER, backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <p className="text-xs text-muted-foreground">
              Browsing as a guest. Log in to chat, save listings, or post your own.
            </p>
            <Link
              to="/login"
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 60%, #FFB000 100%)" }}
            >
              Log in
            </Link>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={
                activeCategory === cat.value
                  ? {
                      background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 60%, #FFB000 100%)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(255,107,0,0.45), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
                      transform: "translateY(-1px)",
                      border: "1px solid rgba(255,140,0,0.5)",
                    }
                  : {
                      background: GLASS_AMBER,
                      backdropFilter: "blur(var(--glass-blur))",
                      WebkitBackdropFilter: "blur(var(--glass-blur))",
                      border: "1px solid rgba(245,158,11,0.15)",
                      color: "hsl(var(--muted-foreground))",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {isInitialLoading
            ? Array(6).fill(0).map((_, i) => <ListingSkeleton key={i} />)
            : listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isSaved={savedIds.has(listing.id)}
                  onToggleSave={(id) => handleSaveClick(id)}
                />
              ))}
        </div>

        {!isInitialLoading && listings.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to post!</p>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="flex items-center justify-center py-6">
          {isFetchingMore && (
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          )}
          {!hasMore && listings.length > 0 && (
            <p className="text-xs text-muted-foreground/50">You've seen all listings</p>
          )}
        </div>
      </div>

      <AIChatBot />
    </div>
  );
}



