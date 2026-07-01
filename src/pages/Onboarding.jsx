import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, MapPin, AtSign } from "lucide-react";

const GATES = ["FUTA NORTHGATE", "FUTA SOUTHGATE", "FUTA WESTGATE"];

function makeUsername(email) {
  return email?.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase() +
    "_" + Math.floor(Math.random() * 1000);
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    phone_number: "",
    location_text: "",
    gate: "",
    bio: "",
  });

  const { data: existingProfile, isLoading: checking } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!checking && existingProfile) {
      navigate("/");
    }
  }, [checking, existingProfile, navigate]);

  const createProfile = useMutation({
    mutationFn: async (data) => {
      const { data: created, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: data.username || makeUsername(user.email),
          full_name: data.full_name || user.user_metadata?.full_name || user.email?.split("@")[0],
          phone_number: data.phone_number || null,
          location_text: data.location_text || null,
          gate: data.gate || null,
          bio: data.bio || null,
          onboarding_complete: true,
          trust_score: 50,
        })
        .select()
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProfile.mutate(form);
  };

  const handleSkip = () => {
    createProfile.mutate({
      username: makeUsername(user.email),
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
      phone_number: "",
    });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (existingProfile) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">
Welcome to FUTA<span className="text-orange-400">MART</span>          </h1>
          <p className="text-muted-foreground text-sm">Complete your profile to get started</p>
        </div>

        {createProfile.isError && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createProfile.error?.message || "Something went wrong. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" /> Username
            </Label>
            <Input
              required
              placeholder="Choose a unique username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="glass border-white/10 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </Label>
            <Input
              required
              placeholder={user?.user_metadata?.full_name || "Your full name"}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="glass border-white/10 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </Label>
            <Input
              required
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="glass border-white/10 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Location
            </Label>
            <Input
              required
              placeholder="Your city or area (e.g. Akure)"
              value={form.location_text}
              onChange={(e) => setForm({ ...form, location_text: e.target.value })}
              className="glass border-white/10 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Nearest FUTA Gate
            </Label>
            <select
              required
              value={form.gate}
              onChange={(e) => setForm({ ...form, gate: e.target.value })}
              className="w-full h-11 rounded-md px-3 text-sm glass border border-white/10 text-foreground bg-transparent"
            >
              <option value="" disabled>Select your gate...</option>
              {GATES.map((g) => (
                <option key={g} value={g} className="bg-background text-foreground">{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Bio (optional)</Label>
            <Textarea
              placeholder="Tell others about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="glass border-white/10 text-foreground h-20"
            />
          </div>

          <GlassButton
            type="submit"
            variant="orange"
            className="w-full h-12 text-base"
            disabled={createProfile.isPending}
          >
            {createProfile.isPending ? "Setting up..." : "Complete Profile"}
          </GlassButton>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={createProfile.isPending}
            className="text-sm text-muted-foreground hover:text-orange-400 transition-colors underline underline-offset-2"
          >
            Skip for now — use my account name
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
