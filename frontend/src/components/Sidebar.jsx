import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Menu } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getFriends } = useChatStore();
  const { onlineUsers, user } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  useEffect(() => {
    getUsers();
    if (user) getFriends(user._id);
  }, [getUsers, getFriends, user]);

  // Debugging: Check if users are being fetched
  useEffect(() => {
    console.log("Fetched Users:", users);
  }, [users]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) { // Only apply on mobile screens
      setIsSidebarOpen((prev) => !prev);
    }
  };
  
  
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarOpen &&
        !e.target.closest(".sidebar-container") &&
        !e.target.closest(".hamburger-menu")
      ) {
        setIsSidebarOpen(false);
      }
    };
  
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarOpen]);
  
  

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const searchFilteredUsers = useMemo(
    () =>
      filteredUsers.filter((user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [filteredUsers, searchQuery]
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
  className="hamburger-menu lg:hidden p-3 fixed top-4 left-4 bg-gray-200 rounded-full shadow-md z-50"
  onClick={toggleSidebar}
>
  <Menu className="size-6 text-purple-400" />
</button>


      {/* Sidebar */}
      <aside
  className={`sidebar-container ${isSidebarOpen ? "open" : ""} lg:relative lg:translate-x-0 lg:w-72 flex flex-col duration-300 z-40`}
>

        {/* Close button for mobile */}
        <button
    className="lg:hidden absolute top-4 right-4 text-gray-600"
    onClick={toggleSidebar}
  >
    ✖
  </button>

        <div className="border-b border-gray-200 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-purple-400 transition-all duration-300 transform hover:scale-110" />
            <span className="font-medium hidden lg:block text-xl">Users</span>
          </div>

          {/* Online filter */}
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm text-gray-700">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>

          {/* Search input */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="w-full py-3 space-y-2 overflow-y-auto flex-1">
          {searchFilteredUsers.length > 0 ? (
            searchFilteredUsers.map((user) => (
              <button
  key={user._id}
  onClick={() => {
    setSelectedUser(user);
    if (window.innerWidth <= 1024) { // Only close sidebar on mobile
      setIsSidebarOpen(false);
    }
  }}
  
  className={`user w-full p-3 flex items-center gap-3 transition-all duration-300 transform hover:translate-x-1
    ${selectedUser?._id === user._id ? "user-selected bg-gray-200" : ""}`}
>
  <div className="relative">
    <img
      src={user.profilePic || "/avatar.png"}
      alt={user.fullName}
      className="size-12 object-cover rounded-full border-2 border-gray-200 transition-all duration-300 transform hover:scale-105"
    />
    {onlineUsers.includes(user._id) && (
      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 gray" />
    )}
  </div>

  <div className="text-left min-w-0 block lg:block">
    <div className="font-medium text-black text-lg">{user.fullName}</div>
  </div>
</button>

            ))
          ) : (
            <div className="text-center text-zinc-500 py-4">No users found</div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
