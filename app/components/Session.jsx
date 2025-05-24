"use client";

import { AuthProvider } from "../hooks/useAuth";

export default function ClientProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
