import ChatLayout from "@/components/chat/ChatLayout";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
const ChatAppPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex h-screen w-full p-2">
        <ChatLayout />
      </div>
    </SidebarProvider>
  );
};

export default ChatAppPage;
