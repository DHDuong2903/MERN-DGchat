import { SidebarInset } from "../ui/sidebar";
import ChatHeader from "./ChatHeader";

const ChatWelcomeScreen = () => {
  return (
    <SidebarInset className="flex w-full h-full bg-transparent">
      <ChatHeader />
      <div className="flex bg-primary-foreground rounded-2xl flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-24 mx-auto mb-6 bg-linear-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center shadow-glow animate-bounce">
            <img src="/logo.png" />
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-linear-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Chào mừng đến với DGchat
          </h2>
          <p className="text-muted-foreground">Chọn một cuộc hội thoại để bắt đầu chat!</p>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWelcomeScreen;
