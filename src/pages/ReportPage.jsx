import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import ListingCard from "@/components/listing/ListingCard";
import ListingSkeleton from "@/components/ListingSkeleton";
import { ArrowLeft, Bookmark } from "lucide-react";

export default function SavedAds() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      const { data, error } = await supabase.from("listings").select("*").in("id", ids);
      if (error) throw error;
      return data;
    },
    enabled: savedListings.length > 0,
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

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display font-bold">Saved Ads</h1>
      </div>
      <div className="p-4">
        {isLoading ? (
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
        )}
      </div>
    </div>
  );
}
