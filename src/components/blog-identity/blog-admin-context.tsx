"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface BlogAdminContextValue {
  isAdmin: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: () => void;
  logout: () => void;
}

const BlogAdminContext = createContext<BlogAdminContextValue | null>(null);

export function BlogAdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const value: BlogAdminContextValue = {
    isAdmin,
    isLoginOpen,
    openLogin: () => setIsLoginOpen(true),
    closeLogin: () => setIsLoginOpen(false),
    login: () => {
      setIsAdmin(true);
      setIsLoginOpen(false);
    },
    logout: () => setIsAdmin(false),
  };

  return (
    <BlogAdminContext.Provider value={value}>
      {children}
    </BlogAdminContext.Provider>
  );
}

export function useBlogAdmin() {
  const context = useContext(BlogAdminContext);

  if (!context) {
    throw new Error("useBlogAdmin must be used within a BlogAdminProvider");
  }

  return context;
}
