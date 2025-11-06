import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

const pair = (a, b) => {
  return a < b ? [a, b] : [b, a];
};

export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user.id.toString();

    const recipientId = req.body?.recipientId ?? null;

    if (!recipientId) {
      return res.status(400).json({ message: "Thieu recipientId" });
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
  } catch (error) {
    console.error("Loi khi checkFriendship", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
