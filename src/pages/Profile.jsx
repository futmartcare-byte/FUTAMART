import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { Navigate, Link } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ProCrown from "@/components/ProCrown";
import VerifiedBadge from "@/components/VerifiedBadge";
import LogoutDialog from "@/components/LogoutDialog";
import { Settings, Star, Package, LogOut, Edit, Camera, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ListingCard from "@/components/listing/ListingCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "futmart_listings";

async function uploadAvatarToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "futmart/avatars");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Avatar upload failed");
  const data = await res.json();
  return data.secure_url;
}

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [showLogout, setShowLogout] = useState(false);
  const queryClient = useQueryClient();

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("created_by_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: savedListings = [] } = useQuery({
    queryKey: ["saved-listings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  const savedIds = new Set(savedListings.map((s) => s.listing_id));

  const toggleSave = useMutation({
    mutationFn: async (listingId) => {
      const existing = savedListings.find((s) => s.listing_id === listingId);
      if (existing) {
        const { error } = await supabase.from("saved_listings").delete().eq("id", existing.id);
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

  const toggleStatus = useMutation({
    mutationFn: async (listing) => {
      const newStatus = listing.status === "active" ? "sold" : "active";
      const { error } = await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("id", listing.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const deleteListing = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing deleted");
    },
    onError: (err) => toast.error(err.message || "Failed to delete listing"),
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file) => {
      const url = await uploadAvatarToCloudinary(file);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile picture updated!");
    },
    onError: (err) => toast.error(err.message || "Failed to upload avatar"),
  });

  if (!isLoading && !profile) return <Navigate to="/onboarding" replace />;
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating_stars, 0) / reviews.length).toFixed(1)
      : "0.0";

  const activeListings = myListings.filter((l) => l.status === "active");
  const soldListings = myListings.filter((l) => l.status === "sold");

  const ListingItem = ({ listing }) => (
    <div className="relative">
      <ListingCard listing={listing} isSaved={savedIds.has(listing.id)} onToggleSave={(id) => toggleSave.mutate(id)} />
      <div className="flex gap-1 mt-1.5">
        <GlassButton variant="ghost" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => toggleStatus.mutate(listing)}>
          {listing.status === "active" ? "Mark Sold" : "Mark Active"}
        </GlassButton>
        <Link to={`/edit-listing/${listing.id}`} className="flex-1">
          <GlassButton variant="ghost" size="sm" className="w-full h-7 text-[10px]">
            <Edit className="w-3 h-3 mr-1" />Edit
          </GlassButton>
        </Link>
        <GlassButton
          variant="ghost" size="sm"
          className="h-7 px-2 text-red-400"
          onClick={() => { if (confirm("Delete this listing?")) deleteListing.mutate(listing.id); }}
        >
          <Trash2 className="w-3 h-3" />
        </GlassButton>
      </div>
    </div>
  );

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold">Profile</h1>
        <div className="flex gap-2">
          <Link to="/settings">
            <GlassButton variant="ghost" size="sm" className="h-9 w-9 p-0"><Settings className="w-4 h-4" /></GlassButton>
          </Link>
          <GlassButton variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setShowLogout(true)}>
            <LogOut className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-2xl font-bold text-orange-400 overflow-hidden">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : profile.username?.[0]?.toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                {uploadAvatar.isPending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadAvatar.isPending}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar.mutate(f); }}
              />
            </label>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-display font-bold">{profile.full_name}</h2>
                {profile.is_pro_seller && <ProCrown />}
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.is_verified_badge && <VerifiedBadge className="mt-1" />}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center glass rounded-xl p-2">
              <p className="text-lg font-bold text-foreground">{myListings.length}</p>
              <p className="text-[10px] text-muted-foreground">Listings</p>
            </div>
            <div className="text-center glass rounded-xl p-2">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{avgRating}
              </p>
              <p className="text-[10px] text-muted-foreground">{reviews.length} Reviews</p>
            </div>
            <div className="text-center glass rounded-xl p-2">
              <p className="text-lg font-bold text-foreground">{profile.trust_score || 50}</p>
              <p className="text-[10px] text-muted-foreground">Trust</p>
            </div>
          </div>
        </GlassCard>

        {/* Pro upgrade CTA */}
        {!profile.is_pro_seller && (
          <Link to="/pro-upgrade">
            <GlassCard className="p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.12), rgba(251,191,36,0.05))" }}>
              <ProCrown size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-400">Become a Pro Seller</p>
                <p className="text-xs text-muted-foreground">Coming Soon — join the waitlist</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-amber-400/50" />
            </GlassCard>
          </Link>
        )}

        {/* My Listings */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> My Listings
          </h3>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="glass w-full grid grid-cols-2 h-9 mb-3">
              <TabsTrigger value="active" className="text-xs">Active ({activeListings.length})</TabsTrigger>
              <TabsTrigger value="sold" className="text-xs">Sold ({soldListings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="grid grid-cols-2 gap-3">
                {activeListings.map((l) => <ListingItem key={l.id} listing={l} />)}
                {activeListings.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No active listings</p>}
              </div>
            </TabsContent>
            <TabsContent value="sold">
              <div className="grid grid-cols-2 gap-3">
                {soldListings.map((l) => <ListingItem key={l.id} listing={l} />)}
                {soldListings.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No sold listings</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LogoutDialog open={showLogout} onClose={() => setShowLogout(false)} />
    </div>
  );
}
