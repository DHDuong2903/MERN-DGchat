import { Friend } from "../models/Friend.js";
import { User } from "../models/User.js";
import { FriendRequest } from "../models/FriendRequest.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;

    const from = req.user.id;

    if (from === to) {
      return res.status(400).json({ message: "Khong the gui yeu cau ket ban voi chinh minh" });
    }

    const userExists = await User.exists({ _id: to });

    if (!userExists) {
      return res.status(404).json({ message: "Nguoi dung khong ton tai" });
    }

    let userA = from.toString();
    let userB = to.toString();

    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }

    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: "Hai nguoi da la ban be" });
    }

    if (existingRequest) {
      return res.status(400).json({ message: "Da co loi moi ket ban dang cho" });
    }

    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res.status(200).json({ message: "Gui loi moi ket ban thanh cong", request });
  } catch (error) {
    console.log("Loi khi gui yeu cau ket ban", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const userId = req.user.id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Khong tim thay loi moi ket ban" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Khong co quyen chap nhan loi moi ket ban nay" });
    }

    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    await FriendRequest.findByIdAndDelete(requestId);

    const from = await User.findById(request.from).select("_id displayName avatarUrl").lean();

    return res.status(200).json({
      message: "Chap nhan loi moi ket ban thanh cong",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.log("Loi khi chap nhan loi moi ket ban", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const userId = req.user.id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Khong tim thay loi moi ket ban" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Ban khong co quyen tu choi loi moi ket ban nay" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    return res.status(200).json({ message: "Tu choi loi moi ket ban thanh cong" });
  } catch (error) {
    console.log("Loi khi tu choi loi moi ket ban", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        {
          userB: userId,
        },
      ],
    })
      .populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();

    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }

    const friends = friendships.map((f) => {
      return f.userA._id.toString() === userId.toString() ? f.userB : f.userA;
    });

    return res.status(200).json({ friends });
  } catch (error) {
    console.log("Loi khi lay danh sach ban be", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const populateFieleds = "_id username displayName avatarUrl";

    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", populateFieleds),
      FriendRequest.find({ to: userId }).populate("from", populateFieleds),
    ]);

    res.status(200).json({ sent, received });
  } catch (error) {
    console.log("Loi khi lay danh sach yeu cau ket ban", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
