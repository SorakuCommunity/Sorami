"use client";

import { create } from "zustand";

interface UIState {
  isSearchOpen: boolean;
  isPlayerOpen: boolean;
  isAuthModalOpen: boolean;
  isProfileMenuOpen: boolean;
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: "success" | "error" | "info" | "warning";
  }>;
  isSidebarExpanded: boolean;
  colorTheme: "dark" | "light";
  
  openSearch: () => void;
  closeSearch: () => void;
  openPlayer: () => void;
  closePlayer: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileMenu: () => void;
  closeProfileMenu: () => void;
  
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
  
  toggleSidebar: () => void;
  setColorTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isPlayerOpen: false,
  isAuthModalOpen: false,
  isProfileMenuOpen: false,
  toasts: [],
  isSidebarExpanded: true,
  colorTheme: "dark",
  
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openPlayer: () => set({ isPlayerOpen: true }),
  closePlayer: () => set({ isPlayerOpen: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openProfileMenu: () => set({ isProfileMenuOpen: true }),
  closeProfileMenu: () => set({ isProfileMenuOpen: false }),
  
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setColorTheme: (colorTheme) => set({ colorTheme }),
}));