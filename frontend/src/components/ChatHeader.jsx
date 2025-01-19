import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import "./ChatHeader.css"

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="chat-header p-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-12 h-12 rounded-full overflow-hidden transition-transform transform hover:scale-110">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-medium text-black text-lg">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/60 transition-all duration-200 text-gray-600">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-full text-zinc-500 hover:text-red-500 transition-all duration-200"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
