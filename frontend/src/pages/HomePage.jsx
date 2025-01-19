import { useChatStore } from "../store/useChatStore";
import "./HomePage.css"
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-screen container">
        <div className=" rounded-lg shadow-xl w-full h-full flex overflow-hidden container-2">
          <Sidebar />
          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-auto container-3 z-10">
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      
    </div>
  );
};
export default HomePage;
