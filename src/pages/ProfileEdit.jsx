import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useProfile } from "@/lib/useProfile";
import { uploadToCloudinary } from "@/lib/uploadImage";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, User, Phone, MapPin, AtSign, FileText } from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAIL = "futmartzite@gmail.com";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && !form) {
      setForm({
        full_name: profile.full_name || "",
        username: profile.username || "",
        phone_number: profile.phone_number || "",
        location_text: profile.location_text || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const isAdmin = profile.id === ADMIN_EMAIL;
      if (data.username !== profile.username && !isAdmin) {
        if ((profile.username_change_count || 0) >= 1) {
          throw new Error("Username can only be changed once");
        }
        const { data: existing } = await supabase
          .from("profiles").select("id").eq("username", data.username).neq("id", profile.id).maybeSingle();
        if (existing) throw new Error("Username already taken");

        const { error } = await supabase.from("profiles").update({
          ...data,
          username_change_count: (profile.username_change_count || 0) + 1,
        }).eq("id", profile.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("profiles").update(data).eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated!");
      navigate("/profile");
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadAvatar = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "futmart/avatars");
      setForm(f => ({ ...f, avatar_url: url }));
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || !form) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-heading font-bold">Edit Profile</h1>
      </div>

      <div className="p-4 space-y-4 pb-24">
        <GlassCard className="p-5 flex flex-col items-center gap-3">
          <label className="relative cursor-pointer group">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-2xl font-bold text-orange-400 overflow-hidden">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                : <User className="w-8 h-8 text-muted-foreground" />}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
          <p className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Tap to change photo"}</p>
        </GlassCard>

        <GlassCard className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="glass border-white/10" placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" /> Username
              {(profile.username_change_count || 0) >= 1 && (
                <span className="text-red-400 text-[10px]">(already changed)</span>
              )}
            </Label>
            <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              className="glass border-white/10" placeholder="username"
              disabled={(profile.username_change_count || 0) >= 1} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</Label>
            <Input value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} className="glass border-white/10" placeholder="+234..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</Label>
            <Input value={form.location_text} onChange={e => setForm({ ...form, location_text: e.target.value })} className="glass border-white/10" placeholder="City or area" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="glass border-white/10 h-24" placeholder="Tell others about yourself..." />
          </div>
        </GlassCard>

        <GlassButton variant="orange" className="w-full h-12 text-base"
          onClick={() => updateProfile.mutate(form)}
          disabled={updateProfile.isPending || uploading}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </GlassButton>
      </div>
    </div>
  );
}
