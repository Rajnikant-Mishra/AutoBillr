import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import GlobalFab from "../floating/GlobalFab";
import { useNotificationStore } from "../../store/notificationStore.js";

export default function MainLayout({ children }) {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />

      <div className="ml-64 min-h-screen flex flex-col">
        <main className="flex-1 pt-20 p-8">
          {children}
        </main>

        <Footer />
      </div>

      <GlobalFab />
    </div>
  );
}