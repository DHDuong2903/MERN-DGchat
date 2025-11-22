import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { emitNewMessage, updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;

    const senderId = req.user._id;

    let conversation;
    if (!content) {
      return res.status(400).json({ message: "Thieu noi dung" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    const isNewConversation = !conversation;

    if (!conversation) {
      const conversationData = {
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      };

      conversation = await Conversation.create(conversationData);

      // Join both users to the new conversation room
      const conversationIdStr = conversation._id.toString();
      const sockets = await io.fetchSockets();
      sockets.forEach((socket) => {
        const socketUserId = socket.user?._id?.toString();
        if (socketUserId === senderId.toString() || socketUserId === recipientId) {
          socket.join(conversationIdStr);
        }
      });
    }

    let message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    // Populate sender info for socket emission
    message = await message.populate("senderId", "displayName avatarUrl");

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    // Return message with conversationId for frontend
    const messageResponse = {
      ...message.toObject(),
      conversationId: conversation._id,
    };

    return res.status(201).json({ message: messageResponse, isNewConversation });
  } catch (error) {
    console.log("Loi sendDirectMessage", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    const senderId = req.user._id;

    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json({ message: "Thieu noi dung" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.log("Loi sendGroupMessage", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
