import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./libs/db.js";
import { protectRoute } from "./middlewares/authMiddleware.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import friendRouter from "./routes/friendRoute.js";
import messageRouter from "./routes/messageRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// public routes
app.use("/api/auth", authRouter);

// private routes
app.use(protectRoute);
app.use("/api/users", userRouter);
app.use("/api/friends", friendRouter);
app.use("/api/messages", messageRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
