import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import GlassButton from "@/components/GlassButton";
import { Lightbulb, LogOut,
  ArrowLeft, ChevronRight, User, Briefcase, Shield, Phone, Mail,
  Share2, MessageSquareOff, BellOff, Bell, Palette, Lock, Sun, Moon, Monitor, Crown, Volume2
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/useTheme";const ADMIN_EMAIL = "futmartzite@gmail.com";

const SettingRow = ({ icon: Icon, label, badge, right, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl glass hover:brightness-110 active:scale-[0.99] transition-all text-left"
    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.05))" }}
  >
    <Icon className="w-5 h-5 text-orange-400 shrink-0" />
    <span className="flex-1 text-sm font-body text-foreground">{label}</span>
    {badge && <span className="text-xs font-bold text-orange-400 mr-1">{badge}</span>}
    {right !== undefined ? right : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
  </button>
);

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-1 mb-1.5">{children}</p>
);

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [editModal, setEditModal] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [msgNotif, setMsgNotif] = useState(localStorage.getItem("futmart-msg-notif") !== "false");
  const [soundNotif, setSoundNotif] = useState(localStorage.getItem("futmart-sound-notif") !== "false");
  const [pushNotif, setPushNotif] = useState(Notification?.permission === "granted");
  const isAdmin = user?.email === ADMIN_EMAIL;

  const openEdit = (title, field, current) => {
    setEditModal({ title, field });
    setEditValue(current || "");
  };

  const updateProfile = useMutation({
    mutationFn: async ({ field, value }) => {
      // Username change limit (once, except admin)
      if (field === "username" && !isAdmin) {
        if ((profile.username_change_count || 0) >= 1) {
          throw new Error("Username can only be changed once");
        }
        // Check uniqueness
        const { data: existing, error: existErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", value);
        if (existErr) throw existErr;
        if (existing.length > 0 && existing[0].id !== profile.id) {
          throw new Error("Username already taken");
        }
        const { error } = await supabase
          .from("profiles")
          .update({
            [field]: value,
            username_change_count: (profile.username_change_count || 0) + 1,
          })
          .eq("id", profile.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Updated!");
      setEditModal(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const THEME_OPTIONS = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-heading font-bold">Settings</h1>
      </div>

      <div className="pb-8 pt-3 px-4 space-y-5">
        {/* Account */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <div className="space-y-2">
            <SettingRow icon={User} label="Personal details" onClick={() => navigate("/onboarding-edit")} />
            <SettingRow icon={User} label="Change username" onClick={() => openEdit("Change Username", "username", profile?.username)}
              badge={!isAdmin && (profile?.username_change_count || 0) >= 1 ? "Used" : undefined} />
            <SettingRow icon={Briefcase} label="Bio / Location" onClick={() => openEdit("Bio", "bio", profile?.bio)} />
            <SettingRow icon={Shield} label='"Verified ID" badge' badge="What is it?"
              onClick={() => toast.info("Verified badge is awarded after 50+ reviews with a 3.0+ average rating.")} />
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionLabel>Contact</SectionLabel>
          <div className="space-y-2">
            <SettingRow icon={Phone} label="Change phone number" onClick={() => openEdit("Phone Number", "phone_number", profile?.phone_number)} />
            <SettingRow icon={Mail} label="Change email" onClick={() => toast.info("Email changes are handled through the auth system.")} />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <SectionLabel>Preferences</SectionLabel>
          <div className="space-y-2">
            <SettingRow icon={Share2} label="Automatic ad sharing" badge="Soon" onClick={() => toast.info("Feature coming soon!")} />
            <SettingRow
              icon={MessageSquareOff}
              label="Message notifications"
              onClick={() => {}}
              right={<Switch checked={msgNotif} onCheckedChange={(v) => { setMsgNotif(v); localStorage.setItem("futmart-msg-notif", v ? "true" : "false"); }} />}
            />
            <SettingRow
              icon={Volume2}
              label="Sound notifications"
              onClick={() => {}}
              right={<Switch checked={soundNotif} onCheckedChange={(v) => { setSoundNotif(v); localStorage.setItem("futmart-sound-notif", v ? "true" : "false"); }} />}
            />
            <SettingRow
              icon={BellOff}
              label="Push notifications"
              onClick={async () => { const r = await Notification.requestPermission(); setPushNotif(r === "granted"); }}
              right={<Switch checked={pushNotif} onCheckedChange={async () => { const r = await Notification.requestPermission(); setPushNotif(r === "granted"); }} />}
            />
            <SettingRow icon={Bell} label="All notifications" onClick={() => navigate("/notifications")} />
          </div>
        </div>

        {/* Appearance & Security */}
        <div>
          <SectionLabel>Appearance & Security</SectionLabel>
          <div className="space-y-2">
            <SettingRow icon={Palette} label="Appearance / Theme" onClick={() => setShowThemeModal(true)}
              badge={THEME_OPTIONS.find(t => t.value === theme)?.label} />
            <SettingRow icon={Lock} label="Change password" onClick={() => toast.info("Use 'Forgot Password' on the login screen to change your password.")} />
          </div>
        </div>

        {/* Pro */}
        {/* Logout */}
        <div>
          <SectionLabel>Account Actions</SectionLabel>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl glass hover:brightness-110 active:scale-[0.99] transition-all text-left"
            style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))" }}
          >
            <LogOut className="w-5 h-5 text-red-400 shrink-0" />
            <span className="flex-1 text-sm font-body text-red-400">Log out</span>
          </button>
        </div>
        <div>
          <SectionLabel>Pro</SectionLabel>
          <SettingRow icon={Crown} label="Pro Seller Plan" badge="Coming Soon" onClick={() => navigate("/pro-upgrade")} />
        </div>
      </div>

      {/* Theme Modal */}
      <Dialog open={showThemeModal} onOpenChange={setShowThemeModal}>
        <DialogContent className="bg-card border-white/10 max-w-sm">
          <DialogHeader><DialogTitle>Choose Theme</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); setShowThemeModal(false); toast.success(`${label} mode activated`); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm transition-all hover:brightness-110 active:scale-[0.99] ${
                  theme === value ? "text-white" : "glass text-muted-foreground hover:text-foreground"
                }`}
                style={
                  theme === value
                    ? { background: "linear-gradient(135deg, #FF6B00, #FF8C00)", boxShadow: "0 4px 14px rgba(255,107,0,0.35)" }
                    : { background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.05))" }
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
                {theme === value && <span className="ml-auto text-xs">Active</span>}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="bg-card border-white/10 max-w-sm">
          <DialogHeader><DialogTitle>{editModal?.title}</DialogTitle></DialogHeader>
          {editModal?.field === "username" && !isAdmin && (profile?.username_change_count || 0) >= 1 ? (
            <p className="text-sm text-muted-foreground text-center py-4">You've already changed your username once. This action is permanent.</p>
          ) : (
            <>
              <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="bg-background border-white/10" />
              <div className="flex gap-2 mt-2">
                <GlassButton variant="ghost" className="flex-1" onClick={() => setEditModal(null)}>Cancel</GlassButton>
                <GlassButton variant="orange" className="flex-1"
                  onClick={() => updateProfile.mutate({ field: editModal.field, value: editValue })}
                  disabled={updateProfile.isPending}>Save</GlassButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}











