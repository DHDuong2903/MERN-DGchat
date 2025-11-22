import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Unauthorized: Token khong ton tai"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized: Token khong hop le"));
    }

    const user = await User.findById(decoded.userId).select("-hashedPassword");

    if (!user) {
      return next(new Error("Unauthorized: User khong ton tai"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.log("Loi khi verify JWT trong socketMiddleware", error);
    next(new Error("Unauthorized: Loi xay ra trong qua trinh xac thuc"));
  }
};
