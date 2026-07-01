import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { uploadToCloudinary } from "@/lib/uploadImage";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "vehicles", label: "Vehicles" },
  { value: "fashion", label: "Fashion" },
  { value: "home_garden", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

function formatPrice(value) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [showLocked, setShowLocked] = useState(false);
  const [form, setForm] = useState(null);

  const { data: listing } = useQuery({
    queryKey: ["listing-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (listing && !form) {
      setForm({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        category: listing.category || "",
        condition: listing.condition || "",
        location_text: listing.location_text || "",
        images: listing.images || [],
      });
    }
  }, [listing]);

  const updateListing = useMutation({
    mutationFn: async (data) => {
      if ((listing.edit_history_count || 0) >= 15) {
        setShowLocked(true);
        throw new Error("Edit limit reached");
      }
      const { error } = await supabase
        .from("listings")
        .update({
          ...data,
          price: parseFloat(data.price),
          edit_history_count: (listing.edit_history_count || 0) + 1,
        })
        .eq("id", listing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing updated!");
      navigate(-1);
    },
    onError: (err) => {
      if (err.message !== "Edit limit reached") {
        toast.error(err.message || "Failed to update listing");
      }
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (form.images.length + files.length > 5) {
      toast.error("Maximum 5 images");
      return;
    }
    setUploading(true);
    try {
      const rawUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file, "futmart/listings"))
      );
      const username = profile?.username || "FUTAMART";
      const urls = rawUrls.map(url => url && url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/l_text:Arial_18_bold:" + encodeURIComponent(username + " x FUTAMART") + ",o_25,co_white,g_south_east,x_10,y_10/") : url);
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch (err) {
      toast.error("Image upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const editsRemaining = 15 - (listing?.edit_history_count || 0);

  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display font-bold">Edit Listing</h1>
        <span className="ml-auto text-xs text-muted-foreground">{editsRemaining} edits left</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); updateListing.mutate(form); }} className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Photos</Label>
          <div className="grid grid-cols-4 gap-2">
            {form.images.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative group glass">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                  className="absolute top-1 right-1 glass p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {form.images.length < 5 && (
              <label className="aspect-square rounded-xl glass flex flex-col items-center justify-center cursor-pointer">
                {uploading
                  ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  : <Camera className="w-5 h-5 text-muted-foreground" />}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="glass border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Price (₦)</Label>
          <Input type="text" inputMode="numeric" value={formatPrice(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d]/g, "") })} className="glass border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="glass border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent className="glass border-white/10">
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Condition</Label>
          <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
            <SelectTrigger className="glass border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass border-white/10 min-h-[100px]" />
        </div>
        <GlassButton type="submit" variant="orange" className="w-full h-12" disabled={updateListing.isPending || editsRemaining <= 0}>
          {editsRemaining <= 0 ? "Edit Limit Reached" : updateListing.isPending ? "Saving..." : "Save Changes"}
        </GlassButton>
      </form>

      <Dialog open={showLocked} onOpenChange={setShowLocked}>
        <DialogContent className="glass border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Edit Limit Reached</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground">This listing has reached the maximum of 5 edits. No further changes can be made.</p>
          <DialogFooter>
            <GlassButton variant="ghost" onClick={() => { setShowLocked(false); navigate(-1); }} className="w-full">OK</GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

