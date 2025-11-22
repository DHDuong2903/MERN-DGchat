import { Conversation } from "../models/Conversation.js";
import { Friend } from "../models/Friend.js";
import { Message } from "../models/Message.js";

const pair = (a, b) => {
  return a < b ? [a, b] : [b, a];
};

export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id.toString();

    const recipientId = req.body?.recipientId ?? null;
    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res.status(400).json({ message: "Thieu recipientId hoac memberIds" });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);

      const isFriend = await Friend.findOne({
        userA,
        userB,
      });

      if (!isFriend) {
        return res.status(403).json({ message: "Ban khong la ban be voi nguoi nay" });
      }

      return next();
    }

    // Chat nhom
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({
        userA,
        userB,
      });
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks);
    const notFriends = results.filter(Boolean);

    if (notFriends.length > 0) {
      return res.status(403).json({ message: "Ban chi co the them ban be vao nhom", notFriends });
    }

    next();
  } catch (error) {
    console.error("Loi khi checkFriendship", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;

    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Cuoc tro chuyen khong ton tai" });
    }

    const isMember = conversation.participants.some((p) => p.userId.toString() === userId.toString());

    if (!isMember) {
      return res.status(403).json({ message: "Ban khong phai thanh vien cua cuoc tro chuyen nay" });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error("Loi khi checkGroupMembership", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
