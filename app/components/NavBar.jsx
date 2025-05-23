"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, SetisDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/Login");
  };

  return (
    <nav
      className={` w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* <Image
                src="/logo.svg"
                alt="Learning Platform Logo"
                width={40}
                height={40}
                className="mr-2"
              /> */}
              <span className="font-bold text-xl">EduLearn</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/courses"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 hover:text-black transition-colors"
              >
                Courses
              </Link>

              {session ? (
                <>
                  {/* Authenticated Navigation Items */}
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 hover:text-black transition-colors"
                  >
                    Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 text-blue-600 hover:text-black transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}

                  {/* User Profile Dropdown */}
                  <div className="relative ml-3 group">
                    <div>
                      <button
                        className="flex items-center text-sm rounded-full focus:outline-none "
                        onClick={() => SetisDropdownOpen(!isDropdownOpen)}
                      >
                        <span className="mr-2">{session.user?.name}</span>
                        {session.user?.image ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={session.user.image}
                            alt={session.user.name || "User Profile"}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            {session.user?.name?.[0] || "U"}
                          </div>
                        )}
                      </button>
                    </div>
                    {isDropdownOpen && isDropdownOpen === true ? (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5  ">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  {/* Non-Authenticated Links */}
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-white shadow-lg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#0a0a0a]">
          <Link
            href="/courses"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            Courses
          </Link>

          {session ? (
            <>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black transition-colors text-white"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-100 hover:text-black transition-colors "
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black transition-colors text-white"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3 flex-row">
                  <span className="mr-2">{session.user?.name}</span>
                  {session.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || "User Profile"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {session.user?.name?.[0] || "U"}
                    </div>
                  )}
                </div>
              </Link>

              <Link
                href="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black transition-colors text-white"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 text-red-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mt-2"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
