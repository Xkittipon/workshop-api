import { PrismaClient } from "@prisma/client";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const prisma = new PrismaClient();

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
    console.log("Login attempt:", email);

    // หา user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found!!" });
    }

    // ตรวจสอบ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password Invalid!!" });
    }

    // payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // generate token
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });

    return res.json({
      message: "Login successful",
      payload,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
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
