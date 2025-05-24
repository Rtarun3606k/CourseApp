"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginButton() {
  const { user, login, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Only show the component after first client render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal if user logs in
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  // Handle sign out
  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  // Unified auth function for both Google and email/password
  const handleAuth = async (authData) => {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", authData.email);

      formData.append("name", authData.name || "");
      formData.append("imageUrl", authData.imageUrl || "");
      if (authData.password) {
        formData.append("password", authData.password);
      }

      const response = await fetch("/api/auth/admin", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Set user data and redirect
      login(data.user);
      setShowAuthModal(false);
      router.push("/Admin/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle email password registration
  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    await handleAuth({
      email,
      password,
      name,
    });
  };

  // Handle email password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    await handleAuth({
      email,
      password,
      name,
    });
  };

  // Return null on first render (server-side)
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2 px-4">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="border-2 border-gray-700 rounded-lg py-8 px-6 w-full max-w-md flex flex-col gap-6 justify-center items-center text-center">
          <span className="font-bold text-3xl">EduLearn</span>
          <h1 className="text-xl font-bold text-white">Login Or Register</h1>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="text-white py-2 px-6 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors duration-200 shadow-md"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-400">
                {authMode === "login"
                  ? "Sign in to continue"
                  : "Register to get started"}
              </p>
            </div>

            {/* Authentication Form */}
            <form
              onSubmit={
                authMode === "login"
                  ? handleEmailLogin
                  : handleEmailRegistration
              }
              className="space-y-4"
            >
              {/* Name field (only for registration) */}
              {authMode === "register" && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={authMode === "register"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Error message */}
              {error && <div className="text-red-500 text-sm">{error}</div>}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : authMode === "login" ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </button>

              {/* Toggle between login and register */}
              <div className="mt-4 text-center text-gray-400 text-sm">
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="text-blue-400 hover:text-blue-300 ml-1"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-blue-400 hover:text-blue-300 ml-1"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
