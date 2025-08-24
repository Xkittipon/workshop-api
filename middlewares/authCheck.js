import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;

    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
    });
    if (!user.enabled) {
      return res.status(400).json({ message: "User is not enabled" });
    }

    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "token verification failed" });
  }
};

export const adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user;

    const admin = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "admin check failed" });
  }
};
