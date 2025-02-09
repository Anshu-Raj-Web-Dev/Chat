import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Copy, Trash2, MoreVertical } from "lucide-react";
import "./ChatContainer.css";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    copyMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const buttonRefs = useRef({}); // Store refs for message buttons
  const dropdownRef = useRef(); // Dropdown menu reference

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !Object.values(buttonRefs.current).some(ref => ref && ref.contains(e.target))) {
        setShowDropdown(null); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // Subscribe to messages
  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleDropdown = (messageId) => {
    setShowDropdown((prev) => (prev === messageId ? null : messageId));
  };

  const handleDelete = (messageId) => {
    console.log("Delete clicked:", messageId); // Debugging line
    setMessageToDelete(messageId); // Set the message to delete
    setShowDeleteConfirmation(true); // Show confirmation modal
  };
  
  const confirmDelete = () => {
    console.log("Message to delete:", messageToDelete); // Debugging line
    deleteMessage(messageToDelete); // Proceed with deletion
    setShowDeleteConfirmation(false); // Close confirmation modal
  };
  

  const cancelDelete = () => {
    setShowDeleteConfirmation(false); // Close modal without deletion
  };

  const handleCopy = (text) => {
    useChatStore.getState().copyMessage(text); // Copy the message
    setShowDropdown(null); // Close the dropdown after copying
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }


  return (
    <>
    <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Itim&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Parkinsans:wght@300..800&family=Playwrite+VN:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          .chat-container{
          font-family: "Parkinsans", serif;
          }
        `}
      </style>
      <div className="chat-container flex-1 flex flex-col overflow-auto bg-[#121212] p-2">

      <ChatHeader />
      <div className="flex-1 overflow-y-scroll p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} transition-opacity duration-300`}
            ref={messageEndRef}
          >
            <div className="text-xs opacity-90 ml-1 text-gray-400">
              {formatMessageTime(message.createdAt)}
            </div>
            <div className={`chat-bubble p-3 rounded-lg shadow-sm relative border ${message.senderId === authUser._id ? "bg-[#4D416B] text-white" : "bg-[#F8F9FA] text-black border-gray-300"}`}>
            {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              <p className="chat-text whitespace-pre-wrap break-words">
                {message.text}
                {message.isEdited && (
                  <span className="text-xs text-gray-500"> (edited)</span>
                )}
              </p>

              {/* Dropdown Menu */}
              {message.senderId === authUser._id && (
                <div className="absolute top-1 left-[-15px]">
                  <button
                    ref={(el) => (buttonRefs.current[message._id] = el)}
                    onClick={() => toggleDropdown(message._id)}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <MoreVertical size={20} />
                  </button>




{showDropdown === message._id && (
  <div
    ref={dropdownRef}
    className="absolute right-0 top-[-35px] mb-5 w-20 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl z-10 flex flex-col items-center p-1"
  >
    {/* Copy Button */}
    <button
      onClick={() => handleCopy(message.text)}
      className="p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200"
    >
      <Copy size={20} className="text-gray-600 hover:scale-110 transition-transform" />
    </button>

    {/* Delete Button */}
    <button
      onClick={() => handleDelete(message._id)}
      className="p-2 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200"
    >
      <Trash2 size={20} className="text-red-500 hover:scale-110 transition-transform" />
    </button>
  </div>
)}

                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
    <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center transform transition-all scale-95">
      <p className="text-lg font-semibold text-black">Delete this message?</p>
      <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Yes, Delete
        </button>
        <button
          onClick={cancelDelete}
          className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


<MessageInput />
    </div>
    </>
  );
};
export default ChatContainer;
