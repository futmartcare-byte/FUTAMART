import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Loader2 } from "lucide-react";
import FileUploadWithCompress from "@/components/FileUploadWithCompress";
import { toast } from "sonner";

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

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "futmart_listings";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "futmart/listings");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}

export default function CreateListing() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location_text: "",
    images: [],
  });

  const createListing = useMutation({
    mutationFn: async (data) => {
      const { data: created, error } = await supabase
        .from("listings")
        .insert({
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          category: data.category,
          condition: data.condition,
          location_text: data.location_text,
          images: data.images,
          status: "active",
          created_by_id: user.id,
          seller_username: profile.username,
          seller_avatar: profile.avatar_url || "",
          seller_is_pro: profile.is_pro_seller || false,
          seller_is_verified: profile.is_verified_badge || false,
        })
        .select()
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing published!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish listing");
    },
  });

  const handleImageUpload = async (e) => {
    const rawFiles = Array.from(e.target.files);
    const files = [];
    for (const f of rawFiles) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is over 1MB � skipped. Please compress it first.`);
      } else {
        files.push(f);
      }
    }
    if (!files.length) return;
    if (form.images.length + files.length > 15) {
      toast.error("Maximum 15 images");
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      toast.error("Image upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.images.length < 3) {
      toast.error("Please add at least 3 images");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (!form.condition) {
      toast.error("Please select a condition");
      return;
    }
    createListing.mutate(form);
  };

  if (!profile) return <Navigate to="/onboarding" replace />;

  return (
    <div className="space-y-0">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <h1 className="text-lg font-display font-bold text-foreground">Create Listing</h1>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Photos (3-15 required)</Label>
          <div className="grid grid-cols-4 gap-2">
            {form.images.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative group glass">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 glass p-1 rounded-full opacity-0 group-hover:opacity-100">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {form.images.length < 15 && (
              <FileUploadWithCompress onFile={async (file) => { if (form.images.length >= 15) { toast.error("Maximum 15 images"); return; } setUploading(true); try { const url = await uploadToCloudinary(file, "futmart/listings"); setForm(prev => ({ ...prev, images: [...prev.images, url] })); } catch { toast.error("Upload failed"); } finally { setUploading(false); } }} accept="image/*" multiple={false}><div className="aspect-square rounded-xl glass flex flex-col items-center justify-center cursor-pointer hover:brightness-110">{uploading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <><Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground mt-1">Add</span></>}</div></FileUploadWithCompress>
            )}
          </div>
          {uploading && (
            <p className="text-xs text-orange-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading images...
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input required value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="glass border-white/10" placeholder="What are you selling?" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Price (₦)</Label>
          <Input required type="number" min="0" step="1" value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="glass border-white/10" placeholder="0" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="glass border-white/10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Condition</Label>
          <Select value={form.condition} onValueChange={v => setForm({ ...form, condition: v })}>
            <SelectTrigger className="glass border-white/10">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Location</Label>
          <Input required value={form.location_text}
            onChange={e => setForm({ ...form, location_text: e.target.value })}
            className="glass border-white/10" placeholder="City or area" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea required value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="glass border-white/10 min-h-[100px]" placeholder="Describe your item..." />
        </div>

        <GlassButton type="submit" variant="orange" className="w-full h-12 text-base"
          disabled={createListing.isPending || uploading}>
          {createListing.isPending ? "Publishing..." : "Publish Listing ₦"}
        </GlassButton>
      </form>
    </div>
  );
}



