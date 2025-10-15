"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-3 px-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Your Stories Admin</h1>
          </div>
        </div>
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}