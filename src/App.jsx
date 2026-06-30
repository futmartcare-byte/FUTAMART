import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { requestNotificationPermission } from "@/lib/firebase";
import { supabase } from "@/api/supabaseClient";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AppLayout from "@/components/AppLayout";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import CreateListing from "@/pages/CreateListing";
import EditListing from "@/pages/EditListing";
import ListingDetail from "@/pages/ListingDetail";
import ChatList from "@/pages/ChatList";
import ChatRoom from "@/pages/ChatRoom";
import Profile from "@/pages/Profile";
import SellerProfile from "@/pages/SellerProfile";
import SavedAds from "@/pages/SavedAds";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Onboarding from "@/pages/Onboarding";
import Notifications from "@/pages/Notifications";
import ProUpgrade from "@/pages/ProUpgrade";
import ReportPage from "@/pages/ReportPage";
import Suggestions from "@/pages/Suggestions";
import ReportPage2 from "@/pages/ReportPage2";
import ProfileEdit from "@/pages/ProfileEdit";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setTimeout(() => {
        requestNotificationPermission(user.id, supabase);
      }, 3000);
    }
  }, [user?.id]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-[11px] text-white/40 tracking-wide">Powered by Ck's Team</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg"
            alt="FUTAMART"
            className="w-24 h-24 rounded-2xl shadow-2xl"
            style={{ animation: "futmartPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          />
          <span className="text-sm text-muted-foreground font-display tracking-wide">FUTAMART</span>
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mt-1" />

        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/seller/:userId" element={<SellerProfile />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route element={<AppLayout />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<SavedAds />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/pro-upgrade" element={<ProUpgrade />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/report2" element={<ReportPage2 />} />
          <Route path="/onboarding-edit" element={<ProfileEdit />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
