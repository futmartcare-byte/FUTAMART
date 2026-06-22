import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

const ADMIN_EMAIL = "futmartzite@gmail.com";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;

      // Keep admin at max trust/verified/pro
      if (profile && user?.email === ADMIN_EMAIL) {
        const needsUpdate =
          profile.trust_score < 100 ||
          !profile.is_verified_badge ||
          !profile.is_pro_seller;
        if (needsUpdate) {
          const { data: updated } = await supabase
            .from("profiles")
            .update({
              trust_score: 100,
              is_verified_badge: true,
              is_pro_seller: true,
            })
            .eq("id", user.id)
            .select()
            .single();
          return updated;
        }
      }

      return profile;
    },
    enabled: !!user?.id,
  });
}

export function useProfileById(userId) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
