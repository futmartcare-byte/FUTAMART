import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import ListingCard from "@/components/listing/ListingCard";
import ListingSkeleton from "@/components/ListingSkeleton";
import { ArrowLeft, Bookmark, Sparkles } from "lucide-react";

export default function SavedAds() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const startX = useRef(null);

  const { data: savedListings = [] } = useQuery({
    queryKey: ["saved-listings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_listings").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const savedIds = new Set(savedListings.map(s => s.listing_id));

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["saved-listing-details", savedListings.map(s => s.listing_id).join(",")],
    queryFn: async () => {
      if (savedListings.length === 0) return [];
      const ids = savedListings.map(s => s.listing_id);
      const { data, error } = await supabase.from("listings").select("*").in("id", ids).eq("seller_is_banned", false);
      if (error) throw error;
      return data;
    },
    enabled: savedListings.length > 0,
  });

  // Get categories from saved listings
  const savedCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];

  // Suggestions: listings in same categories but not already saved
  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ["suggestions", savedCategories.join(",")],
    queryFn: async () => {
      if (savedCategories.length === 0) return [];
      const savedListingIds = savedListings.map(s => s.listing_id);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("category", savedCategories)
        .eq("status", "active")
        .eq("seller_is_banned", false)
        .not("id", "in", "(" + savedListingIds.join(",") + ")")
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: savedCategories.length >= 2,
  });

  const toggleSave = useMutation({
    mutationFn: async (listingId) => {
      const existing = savedListings.find(s => s.listing_id === listingId);
      if (existing) {
        const { error } = await supabase.from("saved_listings").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_listings").insert({ listing_id: listingId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-listings"] }),
  });

  const handleTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setActiveTab(diff > 0 ? 1 : 0);
    startX.current = null;
  };

  const showForYou = savedCategories.length >= 2;

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display font-bold flex-1">Saved Ads</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab(0)}
          className={"flex-1 py-2 rounded-xl text-xs font-bold transition-all " + (activeTab === 0 ? "bg-orange-500/20 text-orange-400 border border-orange-400/30" : "glass text-muted-foreground")}
        >
          <Bookmark className="w-3.5 h-3.5 inline mr-1" />
          Saved
        </button>
        {showForYou && (
          <button
            onClick={() => setActiveTab(1)}
            className={"flex-1 py-2 rounded-xl text-xs font-bold transition-all " + (activeTab === 1 ? "bg-orange-500/20 text-orange-400 border border-orange-400/30" : "glass text-muted-foreground")}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            For You
          </button>
        )}
      </div>

      {/* Swipeable content */}
      <div
        className="p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 0 ? (
          isLoading ? (
            <div className="grid grid-cols-2 gap-3">{Array(4).fill(0).map((_, i) => <ListingSkeleton key={i} />)}</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No saved ads yet</p>
              <p className="text-sm mt-1">Tap the heart on any listing to save it</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggleSave={(id) => toggleSave.mutate(id)} />
              ))}
            </div>
          )
        ) : (
          loadingSuggestions ? (
            <div className="grid grid-cols-2 gap-3">{Array(4).fill(0).map((_, i) => <ListingSkeleton key={i} />)}</div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No suggestions yet</p>
              <p className="text-sm mt-1">Save more listings to get personalised picks</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map(l => (
                <ListingCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggleSave={(id) => toggleSave.mutate(id)} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}



