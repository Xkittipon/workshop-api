import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate email and password
    if (!email || !password) {
      return res.status(400).send("Email and password are required!!");
    }

    //check if user already exists
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      return res.status(400).json({ message: "Email already exits!!" });
    }
    // HashPassword
    const hashPassword = await bcrypt.hash(password, 10);

    // Register
    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    res.send("Register success");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    // หา user ใน database
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user || !user.enabled) {
      return res.status(400).json({ message: "User Not Found!!" });
    }

    // ตรวจสอบ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password Invalid!!" });
    }

    // สร้าง payload สำหรับ token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // generate token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        console.error("JWT error:", err);
        return res.status(500).json({ message: "Server Error" });
      }

      // ส่ง response กลับ frontend
      res.json({
        message: "Login successful",
        payload,
        token,
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
