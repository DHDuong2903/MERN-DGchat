import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const [value, setValue] = useState("");

  if (!user) return;

  const sendMessage = async () => {
    if (!value.trim()) return;
    const currentValue = value;
    setValue("");

    try {
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currentValue);
      } else {
        await sendGroupMessage(selectedConvo._id, currentValue);
      }
    } catch (error) {
      console.log(error);
      toast.error("Gửi tin nhắn thất bại. Vui lòng thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-14 bg-background border-t border-border/50 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.2)]">
      <Button variant="ghost" size="icon" className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
        <ImagePlus className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Soạn tin nhắn..."
          className="pr-20 h-9 bg-background border-border/50 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all resize-none shadow-sm"
        ></Input>

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
          >
            <div>
              <EmojiPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)} />
            </div>
          </Button>
        </div>
      </div>
      <Button
        onClick={sendMessage}
        className="bg-linear-to-tr from-purple-600 to-purple-400 hover:shadow-glow transition-smooth hover:scale-105"
        disabled={!value.trim()}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
