import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatSkeleton from "./ChatSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import MessageInput from "./MessageInput";

const ChatLayout = () => {
  const { activeConversationId, conversations, messageLoading: loading } = useChatStore();

  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-lg border border-border/50">
      {/* HeaderChat */}
      <ChatHeader chat={selectedConvo} />

      {/* BodyChat */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        <ChatBody />
      </div>

      {/* FooterChat */}
      <MessageInput selectedConvo={selectedConvo} />
    </SidebarInset>
  );
};

export default ChatLayout;
