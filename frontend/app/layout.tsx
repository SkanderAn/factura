"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const isLoginPage = pathname === "/login";
    
    if (!token && !isLoginPage) {
      router.push("/login");
      setLoading(false);
    } else if (token) {
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading) return <div className="p-8">Chargement...</div>;

  const isPublicPage = pathname === "/login";
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <html lang="fr">
      <body className="bg-gray-100">
        {showSidebar ? (
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}