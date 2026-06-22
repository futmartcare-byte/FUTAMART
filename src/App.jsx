import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ProtectedRoute from "@/components/ProtectedRoute";

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
import ProfileEdit from "@/pages/ProfileEdit";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-display">FUTAMART</span>
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