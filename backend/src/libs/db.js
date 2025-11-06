import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Ket noi voi DB thanh cong");
  } catch (error) {
    console.log("Khong the ket noi voi DB");
    process.exit(1);
  }
};
