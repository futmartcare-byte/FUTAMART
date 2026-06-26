import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfileById } from "@/lib/useProfile";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ProCrown from "@/components/ProCrown";
import VerifiedBadge from "@/components/VerifiedBadge";
import TrustBadge from "@/components/TrustBadge";
import ListingCard from "@/components/listing/ListingCard";
import { ArrowLeft, Star, MapPin, Flag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SellerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfileById(userId);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [lightbox, setLightbox] = useState(false);

  const { data: listings = [] } = useQuery({
    queryKey: ["seller-listings", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*")
        .eq("created_by_id", userId).eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: soldListings = [] } = useQuery({
    queryKey: ["seller-sold", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*")
        .eq("created_by_id", userId).eq("status", "sold")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["seller-reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*")
        .eq("seller_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
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

  const submitReview = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from("reviews").insert(data);
      if (error) throw error;

      // Check for verified badge
      const { data: allReviews } = await supabase.from("reviews").select("rating_stars").eq("seller_id", userId);
      if (allReviews && allReviews.length >= 50) {
        const avg = allReviews.reduce((s, r) => s + r.rating_stars, 0) / allReviews.length;
        if (avg > 3.0 && profile && !profile.is_verified_badge) {
          await supabase.from("profiles").update({ is_verified_badge: true }).eq("id", userId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews", userId] });
      setRating(0); setReviewText("");
      toast.success("Review submitted!");
    },
    onError: (err) => toast.error(err.message || "Failed to submit review"),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating_stars, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (!profile) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isSelf = userId === user?.id;

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-heading font-bold flex-1">Seller Profile</h1>
        {!isSelf && (
          <Link to={`/report2?type=seller&id=${userId}&name=${encodeURIComponent(profile.full_name || profile.username)}`}
            className="p-2 rounded-full bg-secondary">
            <Flag className="w-4 h-4 text-red-400" />
          </Link>
        )}
      </div>

      <div className="p-4 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="relative w-20 h-20 mx-auto cursor-pointer" onClick={() => profile.avatar_url && setLightbox(true)}>
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-3xl font-bold text-orange-400 overflow-hidden">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile.username?.[0]?.toUpperCase()}
            </div>
            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background ${profile.is_online ? "bg-green-400" : "bg-gray-500"}`} />
          </div>
          {lightbox && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
              <img src={profile.avatar_url} alt="" className="max-w-xs max-h-xs rounded-full" />
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-2">
            <h2 className="text-xl font-display font-bold">{profile.full_name}</h2>
            {profile.is_pro_seller && <ProCrown size="md" />}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.is_verified_badge && <VerifiedBadge className="mt-1 justify-center" />}
          <div className="mt-2 flex items-center justify-center">
            <TrustBadge score={profile.trust_score || 50} />
          </div>
          {profile.location_text && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
              <MapPin className="w-3 h-3" />{profile.location_text}
            </p>
          )}
          {profile.bio && <p className="text-sm text-muted-foreground mt-3">{profile.bio}</p>}
          <p className="text-xs mt-2">
            {profile.is_online
              ? <span className="text-green-400 font-medium">● Online</span>
              : <span className="text-muted-foreground">● {profile.last_seen ? `Last seen ${format(new Date(profile.last_seen), "MMM d, h:mm a")}` : "Offline"}</span>}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="glass rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{listings.length}</p>
              <p className="text-[10px] text-muted-foreground">Listings</p>
            </div>
            <div className="glass rounded-xl p-2 text-center">
              <p className="text-lg font-bold flex items-center justify-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{avgRating}
              </p>
              <p className="text-[10px] text-muted-foreground">{reviews.length} Reviews</p>
            </div>
            <div className="glass rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{profile.trust_score || 50}</p>
              <p className="text-[10px] text-muted-foreground">Trust</p>
            </div>
          </div>
        </GlassCard>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="glass w-full grid grid-cols-3 h-10">
            <TabsTrigger value="listings" className="text-xs">Listings</TabsTrigger>
            <TabsTrigger value="sold" className="text-xs">Sold</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="listings">
            <div className="grid grid-cols-2 gap-3 mt-3">
              {listings.map((l) => <ListingCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggleSave={(id) => toggleSave.mutate(id)} />)}
              {listings.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No active listings</p>}
            </div>
          </TabsContent>
          <TabsContent value="sold">
            <div className="grid grid-cols-2 gap-3 mt-3">
              {soldListings.map((l) => <ListingCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggleSave={(id) => toggleSave.mutate(id)} />)}
              {soldListings.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No sold items yet</p>}
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-3 mt-3">
              {!isSelf && (
                <GlassCard className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Leave a Review</h4>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)}>
                        <Star className={`w-6 h-6 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Why this rating?</Label>
                    <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                      placeholder="Your feedback..." className="glass border-white/10 mt-1 h-20" />
                  </div>
                  <GlassButton variant="orange" className="w-full" disabled={submitReview.isPending}
                    onClick={() => {
                      if (rating === 0) { toast.error("Select a rating"); return; }
                      if (!reviewText.trim()) { toast.error("Please explain your rating"); return; }
                      submitReview.mutate({
                        seller_id: userId, reviewer_id: user.id,
                        reviewer_name: profile?.full_name || "Anonymous",
                        rating_stars: rating, justification_text: reviewText,
                      });
                    }}>
                    Submit Review
                  </GlassButton>
                </GlassCard>
              )}
              {reviews.map(r => (
                <GlassCard key={r.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link to={`/seller/${r.reviewer_id}`}>
                      <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-xs font-bold text-orange-400 overflow-hidden">
                        {r.reviewer_avatar
                          ? <img src={r.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                          : r.reviewer_name?.[0]?.toUpperCase()}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{r.reviewer_name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating_stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />)}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.created_at ? format(new Date(r.created_at), "MMM d, yyyy") : ""}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.justification_text}</p>
                </GlassCard>
              ))}
              {reviews.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No reviews yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
