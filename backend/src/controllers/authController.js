import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: "Khong the thieu username, password, email, firstName, lastName" });
    }

    // kiem tra username da ton tai chua
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(400).json({ message: "username da ton tai" });
    }

    // ma hoa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // tao user moi
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.log("Loi khi goi signUp", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thieu username, password" });
    }

    // kiem tra username co ton tai khong
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "username hoac password khong chinh xac" });
    }

    // lay hashedPassword trong db de so sanh voi password input
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res.status(401).json({ message: "username hoac password khong chinh xac" });
    }

    // neu khop, tao access token voi JWT
    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // tao refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tao session moi de luu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // tra refresh token ve trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // tra access token ve trong res
    return res.status(200).json({ message: `User ${user.displayName} da logged in!`, accessToken });
  } catch (error) {
    console.log("Loi khi goi signIn", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lay refresh token tu cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xoa refresh token trong Session
      await Session.deleteOne({ refreshToken: token });

      // xoa cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.log("Loi khi goi signOut", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

// tao access token moi tu refresh token
export const refreshToken = async (req, res) => {
  try {
    // lay refresh token tu cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(403).json({ message: "Token khong ton tai" });
    }

    // so voi refresh token trong db
    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res.status(403).json({ message: "Token khong hop le hoac da het han" });
    }

    // kiem tra token het han chua
    if (session.expiresAt < Date.now()) {
      return res.status(403).json({ message: "Token da het han" });
    }

    // tao access token moi
    const accessToken = jwt.sign({ userId: session.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    // return

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log("Loi khi goi refreshToken", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
