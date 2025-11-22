import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({ message, index, messages, selectedConvo, lastMessageStatus }: MessageItemProps) => {
  const prev = messages[index - 1];
  const isGroupBreak =
    index === 0 ||
    message.senderId !== prev?.senderId ||
    new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime() > 5 * 60 * 1000;

  const participants = selectedConvo.participants.find((p) => p._id.toString() === message.senderId.toString());

  return (
    <div className={cn("flex gap-2 mt-1", message.isOwn ? "justify-end" : "justify-start")}>
      {/* avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              type="chat"
              name={participants?.displayName ?? "DG"}
              avatarUrl={participants?.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* message */}
      <div className={cn("max-w-xs lg:max-w-md space-y-1 flex flex-col", message.isOwn ? "items-end" : "items-start")}>
        <Card
          className={cn(
            "p-3 shadow-md transition-shadow hover:shadow-lg",
            message.isOwn
              ? "border-0 bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-purple-200 dark:shadow-purple-900/50"
              : "border border-border/50 bg-white dark:bg-slate-800 text-foreground shadow-gray-200 dark:shadow-slate-950/50"
          )}
        >
          <p className="text-sm leading-relaxed break-word">{message.content}</p>
        </Card>

        {/* time */}
        {isGroupBreak && (
          <span className="text-xs text-muted-foreground px-1">{formatMessageTime(new Date(message.createdAt))}</span>
        )}

        {/* seen / delivered */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5 h-4 border-0",
              lastMessageStatus === "seen" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
