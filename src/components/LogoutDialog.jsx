import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import GlassButton from "./GlassButton";
import { useAuth } from "@/lib/AuthContext";

export default function LogoutDialog({ open, onClose }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-xl">
            Are you sure you want to log out?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:justify-center mt-4">
          <GlassButton variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton
            variant="ghost"
            onClick={handleLogout}
            className="flex-1 text-white bg-red-600 hover:bg-red-700 border-none"
            style={{ background: "#dc2626", boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
          >
            Yes, Log me out
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
