import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ProCrown from "@/components/ProCrown";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  ArrowLeft, MapPin, Eye, Calendar, MessageSquare,
  ChevronLeft, ChevronRight, Flag, Trash2, Heart,
  Share2, ShieldCheck, Tag, Package
} from "lucide-react";
import ShareMenu from "@/components/ShareMenu";
import { format } from "date-fns";
import { toast } from "sonner";

function addWatermark(url, username) {
  if (!url || !url.includes("cloudinary.com")) return url;
  const text = encodeURIComponent((username || "FUTAMART") + " x FUTAMART");
  return url.replace("/upload/", "/upload/c_limit,w_800/l_text:Arial_28_bold:" + text + ",co_white,o_55,g_south_east,x_14,y_14/q_auto,f_auto/");
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myProfile } = useProfile();
  const queryClient = useQueryClient();
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [saved, setSaved] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const wasSwipe = useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    wasSwipe.current = false;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      wasSwipe.current = true;
      if (deltaX > 0) {
        setCurrentImage((prev) => Math.max(0, prev - 1));
      } else {
        setCurrentImage((prev) => Math.min(images.length - 1, prev + 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        await supabase
          .from("listings")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", id);
      }
      return data;
    },
  });

  const startChat = useMutation({
    mutationFn: async () => {
      const { data: existingChats } = await supabase
        .from("chats")
        .select("*")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user.id);
      if (existingChats && existingChats.length > 0) return existingChats[0];

      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listing.created_by_id)
        .maybeSingle();

      const { data: chat, error } = await supabase
        .from("chats")
        .insert({
          listing_id: listing.id,
          listing_title: listing.title,
          listing_image: listing.images?.[0],
          listing_price: listing.price,
          seller_id: listing.created_by_id,
          seller_name: sellerProfile?.full_name || "Seller",
          seller_avatar: sellerProfile?.avatar_url || "",
          buyer_id: user.id,
          buyer_name: myProfile?.full_name || "Buyer",
          buyer_avatar: myProfile?.avatar_url || "",
        })
        .select()
        .single();
      if (error) throw error;
      return chat;
    },
    onSuccess: (chat) => navigate(`/chat/${chat.id}`),
    onError: (err) => toast.error(err.message || "Failed to start chat"),
  });

  const deleteListing = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("listings").delete().eq("id", listing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted");
      navigate("/profile");
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-4xl">📦</div>
      <p className="text-lg font-semibold text-foreground">Listing not found</p>
      <p className="text-sm text-muted-foreground text-center">This listing may have been removed or doesn't exist.</p>
      <button onClick={() => navigate("/")} className="px-6 py-2 rounded-full text-sm font-medium text-white"
        style={{ background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 60%, #FFB000 100%)" }}>
        Back to Home
      </button>
    </div>
  );

  const isOwner = listing.created_by_id === user?.id;
  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Image Carousel */}
      <div className="relative w-full bg-black" style={{ aspectRatio: "1/1" }}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="glass p-2.5 rounded-full backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className="glass p-2.5 rounded-full backdrop-blur-md"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
            <ShareMenu listing={listing} />
          </div>
        </div>

        {images.length > 0 ? (
          <>
            <img
              src={addWatermark(images[currentImage], listing?.seller_username)}
              alt={listing.title}
              className="w-full h-full object-cover cursor-zoom-in allow-interaction"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => { if (wasSwipe.current) { wasSwipe.current = false; return; } setLightbox(true); }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                  disabled={currentImage === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentImage(Math.min(images.length - 1, currentImage + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                  disabled={currentImage === images.length - 1}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: i === currentImage ? 20 : 6,
                        height: 6,
                        background: i === currentImage ? "#FF8C00" : "rgba(255,255,255,0.5)",
                      }}
                    />
                  ))}
                </div>
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full text-xs text-white font-medium"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  {currentImage + 1}/{images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-white/20" />
          </div>
        )}

        {listing.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="px-6 py-3 rounded-2xl border-2 border-white/50 rotate-[-15deg]">
              <span className="text-2xl font-black text-white tracking-widest">SOLD</span>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all"
              style={{ borderColor: i === currentImage ? "#FF8C00" : "transparent" }}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (wasSwipe.current) { wasSwipe.current = false; return; } setLightbox(false); }}
        >
          <button className="absolute top-4 right-4 text-white/60 text-sm">tap to close</button>
          <img src={addWatermark(images[currentImage], listing?.seller_username)} alt="" className="max-w-full max-h-[90vh] object-contain allow-interaction" />
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-4 space-y-4">

        {/* Title + Price */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-foreground leading-tight flex-1">{listing.title}</h1>
            {!isOwner && (
              <Link to={`/report2?type=listing&id=${listing.id}&name=${encodeURIComponent(listing.title)}`}>
                <Flag className="w-4 h-4 text-muted-foreground mt-1" />
              </Link>
            )}
          </div>
          <p className="text-3xl font-black text-orange-400">
            ₦{listing.price?.toLocaleString()}
          </p>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold glass border border-white/10">
            <Package className="w-3 h-3 text-orange-400" />
            <span className="capitalize">{listing.condition}</span>
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold glass border border-white/10">
            <Tag className="w-3 h-3 text-orange-400" />
            <span className="capitalize">{listing.category?.replace("_", " ")}</span>
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold glass border border-white/10">
            <MapPin className="w-3 h-3 text-orange-400" />
            {listing.location_text}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />{listing.view_count || 0} views
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {listing.created_at ? format(new Date(listing.created_at), "MMM d, yyyy") : ""}
          </span>
        </div>

        {/* Description */}
        <div className="rounded-2xl p-4 space-y-2"
          style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
          <h3 className="text-sm font-bold text-foreground">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        </div>

        {/* Seller Card */}
        <Link to={`/seller/${listing.created_by_id}`}>
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black text-orange-400 shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,140,0,0.05))", border: "1px solid rgba(255,140,0,0.2)" }}>
              {listing.seller_avatar
                ? <img src={listing.seller_avatar} alt="" className="w-full h-full object-cover" />
                : listing.seller_username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Sold by</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-foreground">{listing.seller_username || "Seller"}</p>
                {listing.seller_is_pro && <ProCrown />}
              </div>
              {listing.seller_is_verified && <VerifiedBadge className="mt-0.5" />}
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-orange-400"
              style={{ background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.2)" }}>
              View Profile
            </div>
          </div>
        </Link>

        {/* Safety notice */}
        <div className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background: "rgba(255,140,0,0.05)", border: "1px solid rgba(255,140,0,0.15)" }}>
          <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Always meet in a safe, public place on campus. Never send money before seeing the item.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)" }}>
        {isOwner ? (
          <div className="space-y-2">
            <div className="text-center text-xs text-muted-foreground mb-2">This is your listing</div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                className="flex-1 h-12 rounded-2xl text-sm font-semibold text-foreground glass border border-white/10"
              >
                Edit Listing
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this listing permanently?")) deleteListing.mutate();
                }}
                disabled={deleteListing.isPending}
                className="flex-1 h-12 rounded-2xl text-sm font-semibold text-red-400 border border-red-400/20 glass"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {deleteListing.isPending ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setSaved(!saved)}
              className="h-12 w-12 rounded-2xl glass border border-white/10 flex items-center justify-center shrink-0"
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
            </button>
            <button
              onClick={() => {
                if (!user) { navigate("/login"); return; }
                startChat.mutate();
              }}
              disabled={startChat.isPending}
              className="flex-1 h-12 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 60%, #FFB000 100%)",
                boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
              }}
            >
              <MessageSquare className="w-5 h-5" />
              {startChat.isPending ? "Opening..." : "Chat with Seller"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
