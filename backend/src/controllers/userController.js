export const authMe = (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Loi khi goi authMe", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const test = (req, res) => {
  return res.sendStatus(204);
};
