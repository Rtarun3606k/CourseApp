"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Only show the component after first client render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on first render (server-side)
  if (!mounted) return null;

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    // User is logged in
    console.log("User is logged in", session);
    return (
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <img
            src={session.user.image}
            width={32}
            height={32}
            alt="User profile"
            className="rounded-full"
          />
        )}
        <span>Hello, {session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
    >
      Sign in with Google
    </button>
  );
}
