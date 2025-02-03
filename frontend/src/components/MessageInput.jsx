import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const emojiPickerRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setEmojiPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  // Check if text is empty or not
  const isTextEmpty = !text.trim();

  return (
    <div className="p-4 w-full bg-base-100 rounded-lg shadow-md bg-white transition-all duration-200">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-2 border-zinc-700 shadow-lg transition-all duration-200"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform transform hover:scale-110"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex gap-3">
          <input
            type="text"
            className="typing-area text-black w-full input input-bordered rounded-lg input-sm sm:input-md transition-all duration-300 focus:ring-1 focus:ring-primary"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {/* Hidden file input for image selection */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Emoji Picker */}
          {isEmojiPickerVisible && (
            <div
              ref={emojiPickerRef}
              className="w-70 absolute bottom-12 right-18 bg-white shadow-lg rounded-lg z-10"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="light"
              />
            </div>
          )}

          {/* Emoji Button */}
          <button
            type="button"
            className="emoji-picker btn btn-circle bg-[#F1F3F7] text-zinc-600 transition-all duration-300 hover:text-emerald-600"
            onClick={() => setEmojiPickerVisible((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {/* Image Upload Button */}
          {/* <button
            type="button"
            className={`hidden sm:flex bg-[#F1F3F7] btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-600"} transition-all duration-300 hover:text-emerald-600`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button> */}
        </div>

        {/* Send Icon (SVG) */}
        <button
          type="submit"
          className="flex items-center justify-center"
          disabled={isTextEmpty && !imagePreview}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 transition-all duration-300 ${isTextEmpty ? "text-zinc-400" : "text-primary"}`}
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z"
                stroke="#000000"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
