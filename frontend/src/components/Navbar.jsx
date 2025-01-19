import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import "./Navbar.css"

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      {/* Navbar */}
      <header className="navbar-container border-b fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80 transition-all duration-300 ease-in-out">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all transform hover:scale-105">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center transition-all">
                  <MessageSquare className="w-5 h-5 text-primary transition-transform transform hover:scale-110" />
                </div>
                <h1 className="text-lg font-bold text-black" >Chatter</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              
              {authUser && (
                <>
                  <Link to={"/profile"} className="flex gap-2 profile">
                    <User className="size-5 transition-transform transform hover:scale-110" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    className="logout flex gap-2 items-center rounded-md"
                    onClick={() => setShowLogoutConfirmation(true)}
                  >
                    <LogOut className="size-4 " />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg p-4 shadow-lg transition-all duration-300 scale-95 animate-fade-in"
            style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-end gap-20">
              <button
                className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 mr-6"
                onClick={() => setShowLogoutConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg p-4 shadow-lg transition-all duration-300 scale-95 animate-fade-in"
            style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-end gap-20">
              <button
                className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 mr-6"
                onClick={() => setShowLogoutConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Animations */}
      <style>
        {`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        `}
      </style>
    </>
  );
};

export default Navbar;
