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
    <div className="chat-container flex-1 flex flex-col overflow-auto bg-[#FDFDFD]">
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
                    ...
                  </button>

                  {showDropdown === message._id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-[0] top-[-6px] w-40 bg-white border border-gray-200 shadow-md rounded-lg z-10"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="text-lg text-black">Are you sure you want to delete this message?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
