import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ProCrown from "@/components/ProCrown";

function addWatermark(url, username) {
  if (!url || !url.includes("cloudinary.com")) return url;
  const text = encodeURIComponent((username || "FUTAMART") + " x FUTAMART");
  return url.replace("/upload/", "/upload/l_text:Arial_28_bold:" + text + ",o_55,co_white,g_south_east,x_14,y_14/");
}

export default function ListingCard({ listing, isSaved, onToggleSave }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: "400px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {!imageLoaded && <div className="absolute inset-0 skeleton-glass" />}
          {isVisible && (
            <img
              src={addWatermark(listing.images?.[0]?.includes("cloudinary.com") ? listing.images[0].replace("/upload/", "/upload/w_400,c_limit,q_80,f_auto/") : listing.images?.[0], listing.seller_username)}
              alt={listing.title}

              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}
          {listing.status === "sold" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-orange-500 px-2 py-0.5 rounded-full font-bold text-[10px] text-white">SOLD</span>
            </div>
          )}
          {listing.seller_is_pro && (
            <div className="absolute top-1.5 left-1.5">
              <ProCrown size="xs" />
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); onToggleSave?.(listing.id); }}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {isSaved
              ? <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              : <Heart className="w-3.5 h-3.5 text-gray-400" />
            }
          </button>
        </div>
      </Link>
      <Link to={`/listing/${listing.id}`}>
        <div className="px-2 py-1.5 space-y-0.5">
          <p className="text-[11px] font-medium text-foreground leading-tight line-clamp-1">
            {listing.title}
          </p>
          <p className="text-[12px] font-bold text-orange-500 font-display">
            ₦{listing.price?.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{listing.location_text}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}


