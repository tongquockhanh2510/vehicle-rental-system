import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, SwitchCamera, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "./AppLayout";
import Sidebar from "../navigation/Sidebar";
import { OWNER_MENU } from "../../constants/navigationConfig";
import { useAuth } from "../../context/AuthContext";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ownerName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "Owner";

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open owner navigation"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-base font-bold text-white md:text-lg">Owner Workspace</p>
              <p className="hidden text-xs text-slate-400 sm:block">Manage requests, fleet health, and revenue</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/explore"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 outline-none transition hover:-translate-y-0.5 hover:bg-cyan-400/15 focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <SwitchCamera className="h-4 w-4" />
              <span className="hidden sm:inline">Back to renting</span>
            </Link>
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white md:block">
              {ownerName}
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              aria-label="Log out"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 outline-none transition hover:border-rose-300/35 hover:bg-rose-500/10 hover:text-rose-100 focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1480px]">
        <Sidebar menu={OWNER_MENU} title="Owner portal" />
        <main className="min-h-[calc(100vh-64px)] flex-1 px-4 pb-12 pt-5 md:px-6 lg:px-7">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Close owner navigation"
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 shadow-2xl shadow-slate-950/60"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
            <div className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4">
              <span className="text-sm font-bold text-white">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close owner navigation"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-100 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar menu={OWNER_MENU} title="Owner portal" mobile onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppLayout>
  );
}
