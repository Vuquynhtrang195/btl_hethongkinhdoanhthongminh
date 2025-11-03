import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token!" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "secret123");
    req.user = { id: decoded.id }; // 👈 dòng cực kỳ quan trọng
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }
}
