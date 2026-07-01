import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import ListingCard from "@/components/listing/ListingCard";
import ListingSkeleton from "@/components/ListingSkeleton";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";

export default function Search() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["search-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings").select("*").eq("status", "active").eq("seller_is_banned", false)
        .order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

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

  const filtered = query
    ? listings.filter(l =>
        l.title?.toLowerCase().includes(query.toLowerCase()) ||
        l.description?.toLowerCase().includes(query.toLowerCase()) ||
        l.category?.toLowerCase().includes(query.toLowerCase())
      )
    : listings;

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings..." className="glass border-white/10 pl-9 pr-9 h-10" />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array(6).fill(0).map((_, i) => <ListingSkeleton key={i} />)
            : filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing}
                  isSaved={savedIds.has(listing.id)} onToggleSave={(id) => toggleSave.mutate(id)} />
              ))}
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground"><p className="text-sm">No results found</p></div>
        )}
      </div>
    </div>
  );
}

