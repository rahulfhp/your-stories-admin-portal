"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import YourStoriesLogo from "../../public/YourStoriesLogo.svg";
import YourStoriesLogoLight from "../../public/YourStoriesLogoLight.svg";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";

// Icons (using Heroicons as replacement for MUI icons)
import {
  MagnifyingGlassIcon as SearchIcon,
  BookmarkIcon,
  BellIcon as NotificationsIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  PencilIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import ThemeSwitcher from "./ThemeSwitcher";

// Types
interface User {
  user?: {
    displayName: string;
    photoURL: string;
  };
  length?: number;
}

interface Admin {
  displayName?: string;
  photoURL?: string;
  email?: string;
  length?: number;
}

interface HeaderProps {
  user?: User;
  admin?: Admin;
  onAdminSignOut?: (router: any) => void;
}

// Logo Component
const Logo: React.FC = () => (
  <div className="w-34 h-10 relative sm:w-36 sm:h-10 md:w-42 md:h-12 lg:w-50 lg:h-15">
    <Image
      src={YourStoriesLogo}
      alt="Logo"
      fill
      className="object-contain dark:block hidden"
    />
    <Image
      src={YourStoriesLogoLight}
      alt="Logo"
      fill
      className="object-contain block dark:hidden"
    />
  </div>
);

// TopBarOption Component
interface TopBarOptionProps {
  Icon?: React.ComponentType<{ className?: string }>;
  avatar?: boolean;
  alt?: string;
  src?: string;
  button?: boolean;
  buttonVariant?: "outlined" | "contained";
  buttonValue?: string;
  onClick?: () => void;
}

const TopBarOption: React.FC<TopBarOptionProps> = ({
  Icon,
  avatar,
  alt,
  src,
  button,
  buttonVariant = "outlined",
  buttonValue,
  onClick,
}) => {
  if (button) {
    const baseClasses =
      "cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 backdrop-blur-sm";
    const variantClasses =
      buttonVariant === "outlined"
        ? "border dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10 dark:hover:border-white/30 border-gray-300/40 text-gray-700 hover:bg-gray-100/20 hover:border-gray-400/50"
        : "dark:bg-white/20 dark:text-white dark:hover:bg-white/30 dark:border-white/10 bg-gray-800/20 text-gray-800 hover:bg-gray-900/30 border-gray-700/10";

    return (
      <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
        {buttonValue}
      </button>
    );
  }

  if (avatar) {
    // Get initials from the name (first letter of first and last name)
    const getInitials = (name?: string) => {
      if (!name) return null; // Return null to show UserIcon instead
      const names = name.trim().split(" ");
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    };

    const initials = getInitials(alt);

    return (
      <div
        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 border backdrop-blur-sm dark:border-white/20 border-gray-300/30"
        onClick={onClick}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide the image and show initials or UserIcon if image fails to load
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className =
                  "w-full h-full bg-gradient-to-br from-blue-500 to-sky-500 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm";
                if (initials) {
                  fallbackDiv.textContent = initials;
                } else {
                  // Create UserIcon for fallback
                  fallbackDiv.innerHTML =
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                }
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-sky-500 backdrop-blur-sm flex items-center justify-center dark:text-white text-white font-semibold text-sm">
            {initials ? initials : <UserIcon className="w-4 h-4" />}
          </div>
        )}
      </div>
    );
  }

  if (Icon) {
    return (
      <div
        className="p-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 backdrop-blur-sm border transition-colors
                   dark:hover:bg-white/10 dark:border-white/10 dark:hover:border-white/20
                   hover:bg-gray-100/20 border-gray-300/20 hover:border-gray-400/30"
        onClick={onClick}
      >
        <Icon className="w-5 h-5 dark:text-white/90 text-gray-700 transition-colors" />
      </div>
    );
  }

  return null;
};

// Main Header Component
const Header: React.FC<HeaderProps> = ({
  user = {},
  admin = {},
  onAdminSignOut,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // State management
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [writePublish, setWritePublish] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  // Ref for mobile menu to detect outside clicks
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    if (pathname.includes("write")) {
      setWritePublish(true);
    } else {
      setWritePublish(false);
    }
  }, [user, pathname]);

  // Handle outside clicks to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    // Add event listener when mobile menu is open
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const isAdminLoggedIn = admin.length || admin.email;

  return (
    <>
      <header className="fixed top-0 left-0 z-[100] w-full">
        {/* Backdrop blur container */}
        <div className="relative">
          {/* Background with blur effect */}
          <div className="absolute inset-0 backdrop-blur-xl border-b shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] dark:bg-black/20 dark:border-white/10 bg-white/20 border-black/10" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-black/30 dark:to-gray-900/40 bg-gradient-to-br from-white/30 to-blue-50/40" />

          {/* Content */}
          <div className="relative flex justify-between items-center w-full px-4 py-2 transition-all duration-500 ease-in-out sm:px-6 sm:py-3 md:px-8 lg:px-12 md:py-4">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center"
                onClick={closeMobileMenu}
              >
                <Logo />
              </Link>
            </div>

            {/* Desktop Actions Section */}
            <div className="hidden md:flex items-center">
              {(
                /* Regular User Section - Desktop */
                <div className="flex items-center gap-3">
                  {/* Theme Switcher */}
                  <ThemeSwitcher />



                  {/* Change Password Button (Desktop) */}
                  <Link
                    href="/change-password"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 backdrop-blur-sm border cursor-pointer
                dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10 dark:hover:border-white/30
                border-gray-300/40 text-gray-700 hover:bg-gray-100/20 hover:border-gray-400/50"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Change Password
                  </Link>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 backdrop-blur-sm border cursor-pointer
                dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10 dark:hover:border-white/30
                border-gray-300/40 text-gray-700 hover:bg-gray-100/20 hover:border-gray-400/50"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions Section */}
            <div className="flex md:hidden items-center gap-2">

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 backdrop-blur-sm border transition-colors
                           dark:hover:bg-white/10 dark:border-white/10 dark:hover:border-white/20
                           hover:bg-gray-100/20 border-gray-300/20 hover:border-gray-400/30"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5 dark:text-white/90 text-gray-700 transition-colors" />
                ) : (
                  <Bars3Icon className="w-5 h-5 dark:text-white/90 text-gray-700 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            ref={mobileMenuRef}
            className={`md:hidden absolute top-full right-0 z-40 w-64 transition-all duration-300 ease-in-out ${
              mobileMenuOpen
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <div className="backdrop-blur-xl border rounded-l-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] dark:bg-black/40 dark:border-white/10 bg-white/40 border-black/10">
              <div className="px-4 py-4 space-y-2">
                {!isAdminLoggedIn && (
                  <>
                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between py-3 px-3 rounded-xl transition-colors duration-200 dark:hover:bg-white/10 hover:bg-gray-100/20">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <SunIcon className="w-5 h-5 dark:text-white/90 text-gray-700 dark:hidden" />
                          <MoonIcon className="w-5 h-5 dark:text-white/90 text-gray-700 hidden dark:block" />
                        </div>
                        <span className="text-sm font-medium dark:text-white/90 text-gray-700">
                          Theme
                        </span>
                      </div>
                      <ThemeSwitcher />
                    </div>


                    {/* Change Password Button (Mobile) */}
                    <Link
                      href="/change-password"
                      className="flex items-center gap-3 py-3 px-3 rounded-xl transition-colors duration-200 
                    dark:hover:bg-white/10 hover:bg-gray-100/20 cursor-pointer"
                    >
                      <PencilIcon className="w-5 h-5" />
                      <span className="text-sm font-medium dark:text-white/90 text-gray-700">Change Password</span>
                    </Link>
                    {/* Logout Button (mobile) */}
                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl transition-colors duration-200 
                    dark:hover:bg-white/10 hover:bg-gray-100/20 cursor-pointer"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 dark:text-white/90 text-gray-700" />
                      <span className="text-sm font-medium dark:text-white/90 text-gray-700">
                        Logout
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export { Header as default };
