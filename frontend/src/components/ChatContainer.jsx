import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
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
    setMessageToDelete(messageId); // Set the message to delete
    setShowDeleteConfirmation(true); // Show confirmation modal
  };

  const confirmDelete = () => {
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
    <div className="chat-container flex-1 flex flex-col overflow-auto bg-[#FDFDFD]">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Itim&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Parkinsans:wght@300..800&family=Playwrite+VN:wght@100..400&display=swap');
        .chat-text {
          font-family: "Itim", serif;
          font-weight: 400;
        }
        `}
      </style>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} transition-opacity duration-300`}
            ref={messageEndRef}
          >
            
            <div className="mb-1">
              <time className="text-xs opacity-50 ml-1 text-black">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col rounded-lg shadow-md p-3 relative break-words ${
                message.senderId === authUser._id ? "bg-[#4D416B] text-white" : "bg-[#F1F3F7] text-black"
              }`}
            >
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
                    <svg
                      fill="#000000"
                      width="15px"
                      height="15px"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M388.8 896.4v-27.198c.6-2.2 1.6-4.2 2-6.4 8.8-57.2 56.4-102.4 112.199-106.2 62.4-4.4 115.2 31.199 132.4 89.199 2.2 7.6 3.8 15.6 5.8 23.4v27.2c-.6 1.8-1.6 3.399-1.8 5.399-8.6 52.8-46.6 93-98.6 104.4-4 .8-8 2-12 3h-27.2c-1.8-.6-3.6-1.6-5.4-1.8-52-8.4-91.599-45.4-103.6-96.8-1.2-5-2.6-9.6-3.8-14.2zm252.4-768.797l-.001 27.202c-.6 2.2-1.6 4.2-1.8 6.4-9 57.6-56.8 102.6-113.2 106.2-62.2 4-114.8-32-131.8-90.2-2.2-7.401-3.8-15-5.6-22.401v-27.2c.6-1.8 1.6-3.4 2-5.2 9.6-52 39.8-86 90.2-102.2 6.6-2.2 13.6-3.4 20.4-5.2h27.2c1.8.6 3.6 1.6 5.4 1.8 52.2 8.6 91.6 45.4 103.6 96.8 1.201 4.8 2.401 9.4 3.601 13.999zm-.001 370.801v27.2c-.6 2.2-1.6 4.2-2 6.4-9 57.4-58.6 103.6-114.6 106-63 2.8-116.4-35.2-131.4-93.8-1.6-6.2-3-12.4-4.4-18.6v-27.2c.6-2.2 1.6-4.2 2-6.4 8.8-57.4 58.6-103.601 114.6-106.2 63-3 116.4 35.2 131.4 93.8 1.6 6.4 3 12.6 4.4 18.8z"></path>
                    </svg>
                  </button>

                  {showDropdown === message._id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-[0] top-[-20] w-40 bg-gray-200 bg-white border border-gray-200 shadow-md rounded-lg z-10 opacity-0 transition-opacity duration-300 ease-in-out transform translate-y-2"
                      style={{
                        opacity: showDropdown === message._id ? 1 : 0,
                        transform: showDropdown === message._id ? "translateY(0)" : "translateY(10px)"
                      }}
                    >
                      <button
                        onClick={() => handleCopy(message.text)}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(message._id)}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg p-4 shadow-lg transition-all duration-300 scale-95 animate-fade-in"
            style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Are you sure you want to delete this message?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="absolute left-4 btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
