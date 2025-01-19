import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus } from "lucide-react";
import axios from "axios";  // To make API calls
import "./Sidebar.css";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getFriends, friends } = useChatStore();
  const { onlineUsers, user } = useAuthStore();  // Assuming user contains the logged-in user info
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    getUsers();
    if (user) {
      getFriends(user._id);  // Fetch the friends when the user is logged in
    }
  }, [getUsers, getFriends, user]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  // Filter users based on search query
  const searchFilteredUsers = filteredUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/api/users/${user._id}/send-request`,  // Ensure this is the correct URL
        { friendId },
        { withCredentials: true }  // Ensure cookies are sent with the request
      );
      alert(response.data.message);  // Success message
      getFriends(user._id);  // Re-fetch friends list
    } catch (error) {
      console.error(error);
      alert("Error sending friend request.");
    }
  };

  return (
    <aside className="sidebar-container lg:w-72 flex flex-col transition-all duration-300 bg-[#FDFDFD] shadow-lg">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-purple-400 transition-all duration-300 transform hover:scale-110" />
          <span className="font-medium hidden lg:block text-xl">Users</span>
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
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
          {/* SVG icon */}
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 "
            width="23px"
            height="23px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_iconCarrier">
              <g clipPath="url(#clip0_15_152)">
                <rect width="24" height="24" fill="none"></rect>
                <circle cx="10.5" cy="10.5" r="6.5" stroke="#000000" strokeLineJoin="round"></circle>
                <path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="#000000"></path>
              </g>
              <defs>
                <clipPath id="clip0_15_152">
                  <rect width="34" height="34" fill="white"></rect>
                </clipPath>
              </defs>
            </g>
          </svg>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input input-bordered w-full pl-10"
          />
        </div>
      </div>

      {/* Users Section */}
      <div className="w-full py-3 space-y-2">
        {searchFilteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`user w-full p-3 flex items-center gap-3 transition-all duration-300 transform hover:translate-x-1
              ${selectedUser?._id === user._id ? "user-selected bg-base-300" : ""}`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full border-2 border-gray-200 transition-all duration-300 transform hover:scale-105"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 gray"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium text-black text-lg">{user.fullName}</div>
              <div className="text-sm text-gray-500">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {searchFilteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
