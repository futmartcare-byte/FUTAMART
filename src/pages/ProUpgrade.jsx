import { Eye, useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { Eye, supabase } from "@/api/supabaseClient";
import { Eye, useAuth } from "@/lib/AuthContext";
import { Eye, toast } from "sonner";
import ProCrown from "@/components/ProCrown";
import { Eye, ArrowLeft, Check, Star, Shield, Zap, BadgeCheck, Headphones } from "lucide-react";

const FEATURES = [
  { icon: Star, label: "Featured listings priority", desc: "Your items appear at the top of search results" },
  { icon: Shield, label: "Pro Seller badge", desc: "Stand out with a verified crown badge" },
  { icon: BadgeCheck, label: "Verified Seller status", desc: "Build trust with buyers instantly" },
  { icon: Eye, label: "100% listing visibility", desc: "Your listings are shown to every user on the home screen" },
  { icon: Zap, label: "Up to 30 listings", desc: "Post more items than standard sellers" },
  { icon: Headphones, label: "Priority support", desc: "Get faster responses from our team" },
];

export default function ProUpgrade() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-heading font-bold">Pro Seller Plan</h1>
      </div>

      <div className="p-4 space-y-5 pb-24">
        {/* Hero */}
        <GlassCard className="p-6 text-center space-y-3" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.05))" }}>
          <ProCrown size="lg" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Pro Seller Plan</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Unlock powerful tools to grow your sales on FUTAMART — built exclusively for serious Futarian sellers.
          </p>
          <div className="inline-block glass rounded-full px-5 py-2 mt-2">
            <span className="text-orange-400 font-bold text-lg">Coming Soon</span>
          </div>
        </GlassCard>

        {/* Pricing */}
        <GlassCard className="p-5 text-center space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Planned Pricing</p>
          <div className="flex items-end justify-center gap-1">
            <span className="text-3xl font-display font-bold text-foreground">₦5,000</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">or ₦50,000/year (save 17%)</p>
        </GlassCard>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground px-1">What you'll get</p>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <GlassCard key={label} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass-orange flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Check className="w-4 h-4 text-green-400 ml-auto shrink-0" />
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <GlassCard className="p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Be the first to know when Pro launches!</p>
          <p className="text-xs text-muted-foreground">Join the waitlist and get early access + a special launch discount.</p>
          <GlassButton
            variant="orange"
            className="w-full h-12 text-base"
            onClick={() => {
              alert("You've been added to the Pro Seller waitlist! We'll notify you when it launches.");
            }}
          >
            <ProCrown />
            <span className="ml-2">Join the Waitlist</span>
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}






