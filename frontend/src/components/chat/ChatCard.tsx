import type React from "react";
import { Card } from "../ui/card";
import { cn, formatOnlineTime } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subTitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subTitle,
}: ChatCardProps) => {
  return (
    <Card
      key={convoId}
      className={cn(
        "border border-border/50 p-3 cursor-pointer transition-all duration-200",
        "shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
        "hover:shadow-[0_4px_12px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_4px_12px_rgba(139,92,246,0.25)]",
        "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
        "hover:border-purple-200/50 dark:hover:border-purple-800/50",
        isActive && "ring-2 ring-primary bg-purple-50/30 dark:bg-purple-950/30"
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn("font-semibold text-sm truncate", unreadCount && unreadCount > 0 && "text-foreground")}>
              {name}
            </h3>

            <span className="text-xs text-muted-foreground">{timestamp ? formatOnlineTime(timestamp) : ""}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">{subTitle}</div>
            <MoreHorizontal className="size-4 text-muted-foreground transition-smooth hover:scale-120" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
