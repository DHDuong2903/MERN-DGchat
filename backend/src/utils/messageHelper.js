export const updateConversationAfterCreateMessage = (conversation, message, senderId) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId: senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};

export const emitNewMessage = (io, conversation, message) => {
  // Convert Map to plain object for JSON
  const unreadCountsObj = {};
  conversation.unreadCounts.forEach((value, key) => {
    unreadCountsObj[key] = value;
  });

  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: message.senderId._id || message.senderId,
          displayName: message.senderId.displayName || "",
          avatarUrl: message.senderId.avatarUrl || null,
        },
      },
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: unreadCountsObj,
  });
};
