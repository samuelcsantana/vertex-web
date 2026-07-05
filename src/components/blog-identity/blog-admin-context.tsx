"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const MOCK_SESSION_KEY = "vertex-blog-mock-admin";

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

  // The initial render must match the server (isAdmin: false), so the
  // mock session is only restored from sessionStorage after mount.
  useEffect(() => {
    if (sessionStorage.getItem(MOCK_SESSION_KEY) === "true") {
      setIsAdmin(true);
    }
  }, []);

  function persist(next: boolean) {
    setIsAdmin(next);
    sessionStorage.setItem(MOCK_SESSION_KEY, String(next));
  }

  const value: BlogAdminContextValue = {
    isAdmin,
    isLoginOpen,
    openLogin: () => setIsLoginOpen(true),
    closeLogin: () => setIsLoginOpen(false),
    login: () => {
      persist(true);
      setIsLoginOpen(false);
    },
    logout: () => persist(false),
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
